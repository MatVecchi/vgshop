"use client";

import Image from "next/image";
import GrainientBg from "@/components/GrainientBg/GrainientBg";
import CardSwap, { Card } from "@/components/ui/CardSwap";
import useSWR from "swr";
import { Game } from "@/components/GameAddModal/GameAddModal";
import { Spinner } from "@/components/ui/spinner";
import Shuffle from "@/components/ui/Shuffle/Shuffle";
import { Press_Start_2P } from "next/font/google";
import DotFieldBg from "@/components/DotFieldBg/DotFieldBg";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"] });

const CARD_W = 900;
const CARD_H = Math.round(CARD_W * (9 / 16));

export default function Home() {
  const {
    data: newGames,
    error: errorNewGames,
    isLoading: isLoadingNewGames,
  } = useSWR<Game[]>(`games/catalogue/recent/`);

  if (errorNewGames) return null;
  if (isLoadingNewGames) return <Spinner />;

  return (
    <DotFieldBg>
      <div className="flex items-center justify-between h-[calc(100vh-64px)] overflow-visible">
        <div className="flex flex-col gap-8 items-center">
          <Shuffle
            className={`${pixelFont.className} text-6xl`}
            text="Benvenuto"
            shuffleDirection="right"
            onShuffleComplete={() => null}
            colorFrom="white"
            colorTo="white"
            duration={0.35}
            animationMode="evenodd"
            shuffleTimes={1}
            ease="power3.out"
            stagger={0.03}
            threshold={0.1}
            triggerOnce={true}
            triggerOnHover
            respectReducedMotion={true}
            loop={false}
            loopDelay={0}
          />
          <Link href="/explore">
            <Button className="w-fit  bg-violet-600 text-white font-bold text-lg p-7 rounded-xl transition-all duration-300 hover:bg-violet-500 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 shadow-md shadow-violet-500/20">
              Esplora il catalogo
            </Button>
          </Link>
        </div>

        <div className="flex items-between justify-center overflow-visible">
          <div
            style={{
              transform: `translate(${CARD_W / 4}px, ${CARD_H / 1.8}px)`,
            }}
          >
            <CardSwap
              width={CARD_W}
              height={CARD_H}
              cardDistance={35}
              verticalDistance={52}
              delay={4500}
              pauseOnHover={false}
              skewAmount={4}
              easing="elastic"
              onCardClick={() => null}
            >
              {newGames?.map((game, index) => {
                const imageUrl = game.images?.[0]?.image;
                return (
                  <Card
                    key={index}
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: "#0f172a",
                      boxShadow:
                        "0 40px 80px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="relative w-full h-full">
                      {imageUrl && imageUrl.trim() !== "" ? (
                        <Image
                          src={imageUrl}
                          fill
                          className="object-cover"
                          priority={index < 3}
                          alt={game.title || "Immagine gioco"}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                          <span className="text-slate-500 text-sm">
                            Nessuna immagine
                          </span>
                        </div>
                      )}

                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.25) 45%, transparent 72%)",
                        }}
                      />

                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h2 className="text-white font-bold text-xl leading-tight drop-shadow-lg">
                          {game.title}
                        </h2>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </CardSwap>
          </div>
        </div>
      </div>
    </DotFieldBg>
  );
}
