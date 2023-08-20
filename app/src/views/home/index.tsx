import Link from "next/link";

export function HomeView() {
  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className="mt-6">
          <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
            Solottie
          </h1>
        </div>
        <h4 className="md:w-full text-2x1 md:text-3xl text-center text-slate-300 my-2">
          <p className="text-slate-700">Lottery Protocol that's OPOS</p>
          <p className="text-slate-500 text-2x1 leading-relaxed">
            Support the network.
          </p>
        </h4>
        <div className="flex justify-center mt-4">
          <div className="flex flex-row justify-center">
            <div className="relative group items-center">
              <div
                className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
              ></div>
              <Link
                href="/pools"
                className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
              >
                <span className="block w-full group-disabled:hidden">
                  Launch App
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
