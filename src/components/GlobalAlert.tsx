import { useAlertStore } from "@/store/alertStore";

export function GlobalAlert() {
  const { message, type, clearAlert } = useAlertStore();

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 px-4 py-2 rounded-md shadow-md text-white transition-opacity duration-300 ${
        type === "error"
          ? "bg-red-500"
          : type === "success"
          ? "bg-green-500"
          : "bg-blue-500"
      }`}
    >
      {message}
      <button className="ml-4" onClick={clearAlert}>
        ✖
      </button>
    </div>
  );
}
