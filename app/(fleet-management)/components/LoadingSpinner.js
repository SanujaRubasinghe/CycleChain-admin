export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
    </div>
  );
}