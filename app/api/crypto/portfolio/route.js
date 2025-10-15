import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function GET() {
  try {
    await dbConnect();

    // Get current ETH price from CoinGecko API
    const ethPriceResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=lkr',
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!ethPriceResponse.ok) {
      throw new Error('Failed to fetch ETH price');
    }

    const ethPriceData = await ethPriceResponse.json();
    const ethToLkr = ethPriceData.ethereum.lkr;
    const lkrToEth = 1 / ethToLkr;

    // Get all crypto payments (ETH payments)
    const cryptoPayments = await Payment.find({
      method: 'crypto',
      status: 'completed'
    }).sort({ createdAt: -1 });

    // Calculate portfolio metrics
    const totalLkrFromCrypto = cryptoPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalEthValue = totalLkrFromCrypto * lkrToEth;

    // Get recent crypto payments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCryptoPayments = cryptoPayments.filter(payment =>
      new Date(payment.createdAt) >= thirtyDaysAgo
    );

    const recentLkrFromCrypto = recentCryptoPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const recentEthValue = recentLkrFromCrypto * lkrToEth;

    // Group crypto payments by date (for chart)
    const dailyCryptoData = {};
    cryptoPayments.forEach(payment => {
      const date = new Date(payment.createdAt).toISOString().split('T')[0];
      if (!dailyCryptoData[date]) {
        dailyCryptoData[date] = { date, lkrAmount: 0, ethAmount: 0 };
      }
      dailyCryptoData[date].lkrAmount += payment.amount;
      dailyCryptoData[date].ethAmount += payment.amount * lkrToEth;
    });

    const chartData = Object.values(dailyCryptoData)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    // Calculate portfolio growth (compare with 30 days ago)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const oldCryptoPayments = cryptoPayments.filter(payment =>
      new Date(payment.createdAt) >= sixtyDaysAgo && new Date(payment.createdAt) < thirtyDaysAgo
    );

    const oldLkrFromCrypto = oldCryptoPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const oldEthValue = oldLkrFromCrypto * lkrToEth;

    const growthPercentage = oldEthValue > 0 ? ((totalEthValue - oldEthValue) / oldEthValue) * 100 : 0;

    return NextResponse.json({
      success: true,
      portfolio: {
        totalEthValue,
        totalLkrValue: totalLkrFromCrypto,
        recentEthValue,
        recentLkrValue: recentLkrFromCrypto,
        growthPercentage,
        ethPrice: ethToLkr,
        lkrToEthRate: lkrToEth
      },
      chartData,
      recentPayments: recentCryptoPayments.slice(0, 10).map(payment => ({
        id: payment._id,
        amount: payment.amount,
        ethAmount: payment.amount * lkrToEth,
        date: payment.createdAt,
        transactionId: payment.transactionId
      })),
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error("Error fetching crypto portfolio data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch crypto portfolio data" },
      { status: 500 }
    );
  }
}
