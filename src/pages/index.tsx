import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import Head from "next/head";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

const HomePage = dynamic(() => import("@/modules/home/components/home-page"), {
  loading: () => (
    <div className="flex items-center min-h-96">
      <span className="text-3xl mr-4">Cargando</span>
      <svg
        className="animate-spin h-5 w-5 text-gray-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx={12}
          cy={12}
          r={10}
          stroke="currentColor"
          strokeWidth={4}
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  ),
  ssr: false,
});

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center gap-16 p-24 ${inter.className}`}
    >
      <Head>
        <title>Calculador de mesada</title>
      </Head>
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>
      <HomePage />
    </main>
  );
}
