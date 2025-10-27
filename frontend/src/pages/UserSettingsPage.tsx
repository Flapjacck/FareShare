import { useMemo, useState } from "react";

type Mode = "rider" | "driver";

const mockProfile = {
  name: "Bob Loblaw",
  joined: "September 2025",
  description: "Male, 32 years old",
};

export default function UserSettingsPage() {
  const [mode, setMode] = useState<Mode>("rider");

  const actionSections = useMemo(() => {
    const base = [
      { label: "Personal details", helper: "name, phone number, ..." },
      { label: "Email address" },
    ];

    if (mode === "driver") {
      return [
        ...base.slice(0, 1),
        { label: "Vehicles", helper: "car, license plate, insurance" },
        ...base.slice(1),
      ];
    }

    return base;
  }, [mode]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2 font-medium"
        >
          <span className="text-xl">←</span>
          <span>Back</span>
        </button>
        <img
          src="/FareShare_Logo.png"
          alt="FareShare logo"
          className="h-8 w-auto object-contain"
        />
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Account</span>
          <span role="img" aria-label="account icon" className="text-2xl">
            👤
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-4 pt-4 flex justify-center">
            <div className="inline-flex rounded-full border border-gray-200 overflow-hidden bg-gray-100">
              {(["rider", "driver"] as const).map((value) => {
                const isActive = mode === value;
                const baseClasses =
                  "px-6 py-2 text-sm font-semibold transition focus:outline-none";
                const activeClasses = "bg-blue-600 text-white";
                const inactiveClasses =
                  "text-gray-600 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500";
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value)}
                    className={`${baseClasses} ${
                      isActive ? activeClasses : inactiveClasses
                    }`}
                  >
                    {value === "rider" ? "Rider" : "Driver"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Settings
            </h1>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
              <div className="flex flex-col items-center gap-3">
                <div className="h-32 w-32 rounded-full bg-blue-100 border-4 border-blue-600 flex items-center justify-center text-4xl font-bold text-blue-700">
                  {mockProfile.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Upload new photo
                </button>
              </div>
              <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoPill label={mockProfile.name} />
                <InfoPill label={`Joined ${mockProfile.joined}`} />
                <InfoPill label={mockProfile.description} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-4 py-5 sm:px-6">
            <div className="space-y-3">
              {actionSections.map(({ label, helper }) => (
                <button
                  key={label}
                  type="button"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{label}</p>
                      {helper && (
                        <p className="text-sm text-gray-500">{helper}</p>
                      )}
                    </div>
                    <span className="text-gray-400 text-xl">›</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Change password
                    </p>
                    <p className="text-sm text-gray-500">
                      Update your current password to keep your account secure.
                    </p>
                  </div>
                  <span className="text-gray-400 text-xl">›</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Privacy</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left shadow-sm hover:border-blue-500"
              >
                <p className="font-semibold text-gray-800">Request data export</p>
                <p className="text-sm text-gray-500">
                  Receive a copy of your account data via email.
                </p>
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left shadow-sm hover:border-blue-500"
              >
                <p className="font-semibold text-gray-800">Delete account</p>
                <p className="text-sm text-gray-500">
                  Start the process to permanently remove your FareShare account.
                </p>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoPill({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
      {label}
    </div>
  );
}
