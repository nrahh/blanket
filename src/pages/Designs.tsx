import { useEffect, useState } from "react";

const designJsons = import.meta.glob("../designs/jsons/*.json", {
    eager: true,
    import: "default",
    query: "?raw",
});

const designs = Object.entries(designJsons)
    .filter(([path]) => !path.endsWith("/example.json"))
    .map(([path, designJson]: [string, any]) => ({
        ...JSON.parse(designJson),
        slug: path.split("/").pop()!.replace(".json", ""),
    }));

export default function Designs() {
    const [pathname, setPathname] = useState(window.location.pathname);

    useEffect(() => {
        const handlePopState = () => setPathname(window.location.pathname);
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const selectedDesign = designs.find((design) => pathname === `/designs/${design.slug}`);

    const openDesign = (slug: string) => {
        window.history.pushState({}, "", `/designs/${slug}`);
        setPathname(window.location.pathname);
        window.scrollTo(0, 0);
    };

    if (selectedDesign) {
        return (
            <main className="min-h-screen w-full bg-[#0A0A0A] flex items-center justify-center p-6">
                <article className="w-full max-w-4xl flex flex-col gap-4">
                    <img src={selectedDesign.pathToImage} alt={selectedDesign.designName} className="w-full rounded-lg object-cover" />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold text-white">{selectedDesign.designName}</h1>
                        <p className="text-white/50">{selectedDesign.designDescription}</p>
                    </div>
                </article>
            </main>
        );
    }

    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-8">
            {designs.map((design) => (
                <div key={design.slug} onClick={() => openDesign(design.slug)} className="w-full flex flex-col gap-2 p-3 bg-white/5 rounded-lg border-t border-l-[0.5px] border-r-[0.5px] border-b-0 border-white/10 cursor-pointer">
                    <img src={design.pathToImage} alt={design.designName} className="w-full aspect-video object-cover rounded-md" />
                    <div className="flex flex-col">
                        <h2 className="text-left text-lg text-white">{design.designName}</h2>
                        <p className="text-white/50 line-clamp-2">{design.designDescription}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}