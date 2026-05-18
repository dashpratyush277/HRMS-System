import getFileUrl from "../../utils/getFileUrl";

const SIZES = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-sm",
  md: "w-11 h-11 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-3xl",
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

const UserAvatar = ({ user, size = "md", className = "" }) => {
  const sizeClass = SIZES[size] || SIZES.md;
  const imageUrl  = getFileUrl(user?.profileImage);
  const initials  = getInitials(user?.name);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={user?.name || "User"}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-slate-600 ${className}`}
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
        flex items-center justify-center font-semibold text-white ring-2 ring-slate-600 ${className}`}
    >
      {initials || "?"}
    </div>
  );
};

export default UserAvatar;
