const FormSection = ({ title, children }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
    <h3 className="text-sm font-semibold text-white mb-5 pb-3 border-b border-slate-800">
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {children}
    </div>
  </div>
);

export default FormSection;
