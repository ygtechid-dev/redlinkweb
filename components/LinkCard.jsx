"use client";

export default function LinkCard({ link, onDelete }) {
  return (
    <div className="border rounded p-3 flex items-center justify-between hover:shadow">
      <div>
        <p className="font-semibold">{link.title}</p>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 text-sm"
        >
          {link.url}
        </a>
      </div>
      <button
        onClick={onDelete}
        className="text-red-600 hover:text-red-800 font-semibold"
      >
        ✕
      </button>
    </div>
  );
}
