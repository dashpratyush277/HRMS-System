const RatingStars = ({ rating, max = 5 }) => {
  if (!rating) return <span className="text-slate-500 text-sm">No rating</span>;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? "text-yellow-400" : "text-slate-600"}>
          ★
        </span>
      ))}
      <span className="ml-1 text-slate-400 text-xs">({rating})</span>
    </span>
  );
};

export default RatingStars;
