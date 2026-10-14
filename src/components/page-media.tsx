"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Play, X } from "lucide-react";

type Photo = { src: string; alt: string };
export function PhotoCollection({ photos, label }: { photos: Photo[]; label: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected === null) {
      dialog.current?.close();
      return;
    }
    if (!dialog.current?.open) dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight")
        setSelected((i) => (i === null ? null : (i + 1) % photos.length));
      if (event.key === "ArrowLeft")
        setSelected((i) => (i === null ? null : (i + photos.length - 1) % photos.length));
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", key);
    };
  }, [selected, photos.length]);
  return (
    <>
      <div className="page-photo-grid">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            className="page-photo"
            onClick={() => setSelected(i)}
            aria-label={`View ${label} photo ${i + 1}`}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              width={700}
              height={520}
              loading="lazy"
              decoding="async"
            />
            <span aria-hidden="true">
              {String(i + 1).padStart(2, "0")} <span>↗</span>
            </span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="photo-lightbox"
        aria-label={`${label} photo viewer`}
        onClose={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
        data-lenis-prevent
      >
        {selected !== null && (
          <div className="photo-lightbox-inner">
            <button
              className="photo-close"
              onClick={() => setSelected(null)}
              aria-label="Close photo viewer"
            >
              <X />
            </button>
            <img src={photos[selected].src} alt={photos[selected].alt} />
            <div className="photo-controls">
              <button
                onClick={() => setSelected((selected + photos.length - 1) % photos.length)}
                aria-label="Previous photo"
              >
                <ArrowLeft />
              </button>
              <span>
                {label} · {selected + 1} / {photos.length}
              </span>
              <button
                onClick={() => setSelected((selected + 1) % photos.length)}
                aria-label="Next photo"
              >
                <ArrowRight />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

export function GalleryCollection({ groups }: { groups: { name: string; images: Photo[] }[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <>
      <div className="gallery-filters" role="tablist" aria-label="Gallery communities">
        {groups.map((group, i) => (
          <button
            key={group.name}
            ref={(node) => {
              tabs.current[i] = node;
            }}
            role="tab"
            id={`gallery-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`gallery-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              let next = i;
              if (e.key === "ArrowRight") next = (i + 1) % groups.length;
              else if (e.key === "ArrowLeft") next = (i + groups.length - 1) % groups.length;
              else if (e.key === "Home") next = 0;
              else if (e.key === "End") next = groups.length - 1;
              else return;
              e.preventDefault();
              setActive(next);
              tabs.current[next]?.focus();
            }}
          >
            {group.name}
            <span>{group.images.length}</span>
          </button>
        ))}
      </div>
      <div
        key={active}
        role="tabpanel"
        id={`gallery-panel-${active}`}
        aria-labelledby={`gallery-tab-${active}`}
        tabIndex={0}
      >
        <PhotoCollection photos={groups[active].images} label={groups[active].name} />
      </div>
    </>
  );
}

export function VideoCollection({
  videos,
}: {
  videos: { id: string; title: string; name: string }[];
}) {
  const [playing, setPlaying] = useState<string[]>([]);
  return (
    <div className="page-video-grid">
      {videos.map((video, i) => (
        <article key={video.id}>
          <div className="video-frame">
            {playing.includes(video.id) ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`}
                title={video.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                onClick={() => setPlaying((ids) => [...ids, video.id])}
                aria-label={`Play ${video.title}`}
              >
                <img
                  src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                  alt=""
                  width={480}
                  height={360}
                  loading="lazy"
                  decoding="async"
                />
                <span className="video-play">
                  <Play size={25} fill="currentColor" />
                </span>
              </button>
            )}
          </div>
          <p className="eyebrow">{String(i + 1).padStart(2, "0")} · Sustainable living</p>
          <h3>{video.name}</h3>
        </article>
      ))}
    </div>
  );
}
