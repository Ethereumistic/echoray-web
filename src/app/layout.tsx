import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
	variable: "--font-sans",
	subsets: ["latin"],
});

const serif = Lora({
	variable: "--font-serif",
	subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "Echoray | Digital Excellence",
	description: "Bringing clarity and understanding to the web's complexity.",
	manifest: "/manifest.json",
};

import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/lib/convex";
import { Toaster } from "@/components/ui/sonner";
import { PermissionDebugger } from "@/components/debug/permission-debugger";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ConvexAuthNextjsServerProvider>
			<html lang="en">
				<body className={`${sans.variable} ${serif.variable} ${mono.variable} font-sans dark antialiased`}>
					<ConvexClientProvider>
						{children}
						<PermissionDebugger />
						<Toaster position="top-right" expand={false} richColors />
					</ConvexClientProvider>
				</body>
			</html>
		</ConvexAuthNextjsServerProvider>
	);
}
