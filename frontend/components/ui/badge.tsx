import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "error" | "destructive" | "info" | "outline";
  children: React.ReactNode;
}

const Badge = ({ className = "", variant = "default", children, ...props }: BadgeProps) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 border-gray-300",
    secondary: "bg-gray-200 text-gray-700 border-gray-400",
    success: "bg-green-100 text-green-800 border-green-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    error: "bg-red-100 text-red-800 border-red-300",
    destructive: "bg-red-100 text-red-800 border-red-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
    outline: "bg-transparent text-gray-700 border-gray-300",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Badge };
