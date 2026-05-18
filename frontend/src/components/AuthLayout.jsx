import AnimatedAuthBackground from "./auth/AnimatedAuthBackground";

// Full-screen centered auth layout with animated cosmic background.
// Used by Login, Register, ForgotPassword, ResetPassword.
// All page-specific content (headings, forms) lives in the child page component.
const AuthLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center overflow-hidden px-4 py-10">
      <AnimatedAuthBackground />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
