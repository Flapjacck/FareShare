import { Link } from "react-router-dom";

export default function SignUpSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="bg-gray-50 rounded p-6 text-center shadow">
          <img src="/fare-share-logo.png" alt="FareShare" className="h-20 mx-auto mb-4" />
          <div className="border rounded bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Thank you for registering with FareShare!</h2>
            <p className="text-sm text-gray-600">You should receive an email to verify your account registration shortly.</p>
          </div>

          <div className="mt-6">
            <Link to="/signin" className="inline-block w-full bg-white border border-gray-700 rounded py-3 text-sm font-medium">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
