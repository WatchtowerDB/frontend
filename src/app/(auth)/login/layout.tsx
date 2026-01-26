import localFont from "next/font/local";

// export const vipnagorgialla = localFont({
//   src: [
//     {
//       path: "../../../../public/fonts/Vipnagorgialla Rg.otf",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "../../../../public/fonts/Vipnagorgialla Bd.otf",
//       weight: "700",
//       style: "normal",
//     },
//   ],
//   variable: "--font-vipnagorgialla",
//   display: "swap",
// });

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-background min-h-screen w-full">{children}</div>;
}
