import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DigitalServices4U — Premium Digital Subscriptions",
    short_name: "Digitals4U",
    description:
      "Tunisia's trusted premium digital subscription marketplace. AI tools, streaming accounts, and software subscriptions with instant WhatsApp delivery.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
