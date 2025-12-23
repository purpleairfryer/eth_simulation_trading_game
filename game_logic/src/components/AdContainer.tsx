export const AdContainer = () => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-lg p-3 shadow-xl border border-emerald-900/30 h-full flex items-center justify-center">
      <a
        href="https://substack.com/@hieuatworks"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-full hover:opacity-90 transition-opacity"
      >
        <img
          src="/ads/thumbnail.png"
          alt="Advertisement"
          className="w-full h-full object-contain rounded-lg"
        />
      </a>
    </div>
  );
};
