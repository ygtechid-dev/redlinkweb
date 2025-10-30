"use client";

export default function PhonePreview({ username, blocks }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <h3 className="font-semibold text-gray-700 mb-3">Page Preview</h3>

      <div className="relative w-[300px] h-[600px] bg-gray-200 rounded-[2rem] border-4 border-gray-400 overflow-hidden shadow-inner">
        {/* notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-5 bg-black rounded-b-lg"></div>

        {/* screen */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 text-white flex flex-col items-center justify-start pt-16 px-4">
          <img
            src="https://i.imgur.com/BmCeG1F.png"
            alt="avatar"
            className="w-20 h-20 rounded-full border-4 border-white mb-2"
          />
          <h4 className="font-bold text-lg mb-2">@{username}</h4>

          <div className="flex flex-col gap-2 w-full">
            {blocks.length === 0 ? (
              <p className="text-sm opacity-80 text-center">Belum ada link</p>
            ) : (
              blocks.map((b) => (
                <a
                  key={b.id}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white text-red-600 text-center py-2 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  {b.title}
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
