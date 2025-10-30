"use client";

export default function BlockCard({ block, onDelete }) {
  return (
    <div className="border rounded p-3 flex justify-between items-center hover:shadow transition">
      <div>
        <p className="font-semibold">{block.title}</p>
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-red-500"
        >
          {block.url}
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
