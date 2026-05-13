import { Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const { user } = useAuth();

    //if (!user) {
      //  return <Navigate to="/login" />
    //}

    return children;
}
export default ProtectedRoute;