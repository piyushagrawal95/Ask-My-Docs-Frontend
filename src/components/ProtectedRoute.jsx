import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper gap-3">
        <div className="w-6 h-6 border-2 border-moss border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-ink-soft">Loading Ask My Docs…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return children;
}
