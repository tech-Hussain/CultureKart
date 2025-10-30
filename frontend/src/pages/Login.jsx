/**
 * Login/Authentication Page
 */

function Login() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome to CultureKart</h1>
        <p className="text-gray-600 text-center mb-8">
          Sign in to access your account
        </p>
        <div className="space-y-4">
          <button className="w-full btn-primary py-3 flex items-center justify-center gap-2">
            <span>🔥</span>
            Sign in with Google
          </button>
          <p className="text-sm text-gray-500 text-center">
            Firebase authentication will be implemented here
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
