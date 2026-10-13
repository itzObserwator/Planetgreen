"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { communities, contact, type Community } from "@/data/content";
import { Action, Eyebrow } from "./ui";

function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (open) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [open]);
  return { ref, onClose };
}

export function ContactDialog({
  open,
  onClose,
  initialCommunity = "Farm Natura",
}: {
  open: boolean;
  onClose: () => void;
  initialCommunity?: string;
}) {
  const { ref } = useDialog(open, onClose);
  const [draft, setDraft] = useState("");
  useEffect(() => {
    if (open) setDraft("");
  }, [open]);

  function prepareEnquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `Planet Green visit enquiry — ${data.get("community")}`;
    const body = `Hello Planet Green,\n\nI would like to learn more about ${data.get("community")} and arrange a visit.\n\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone") || "Not provided"}\nPreferred date: ${data.get("date") || "Please suggest a date"}\n\n${data.get("message") || "Please share the next steps and available visiting times."}\n\nThank you!`;
    setDraft(
      `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  }

  return (
    <dialog
      ref={ref}
      className="contact-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="contact-dialog-title"
      data-lenis-prevent
    >
      <div className="dialog-inner">
        <button className="dialog-close" onClick={onClose} aria-label="Close enquiry">
          <X size={23} strokeWidth={1.2} />
        </button>
        <Eyebrow>Your next chapter</Eyebrow>
        <h2 id="contact-dialog-title">
          Let’s get you
          <br />
          closer to nature.
        </h2>
        {draft ? (
          <div className="enquiry-ready">
            <span className="ready-icon">
              <Check size={25} strokeWidth={1.3} />
            </span>
            <h3>Your enquiry is ready.</h3>
            <p>
              Open your email app to send it to our team. We’ll help you find the right place and
              confirm your visit.
            </p>
            <Action href={draft}>Open email draft</Action>
            <button className="text-button" onClick={() => setDraft("")}>
              Edit your enquiry
            </button>
          </div>
        ) : (
          <>
            <p className="dialog-intro">
              Tell us a little about yourself. Our team will help you explore the Planet Green
              world.
            </p>
            <form key={initialCommunity} onSubmit={prepareEnquiry} className="enquiry-form">
              <div className="form-row">
                <label>
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Full name"
                    maxLength={100}
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    maxLength={150}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Phone number <span>(optional)</span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91"
                    maxLength={30}
                  />
                </label>
                <label>
                  I’m interested in
                  <select name="community" defaultValue={initialCommunity}>
                    {communities.map((c) => (
                      <option key={c.id}>{c.name}</option>
                    ))}
                    <option>Planet Green</option>
                  </select>
                </label>
              </div>
              <label>
                Preferred visit date <span>(optional)</span>
                <input name="date" type="date" />
              </label>
              <label>
                Anything you’d like us to know? <span>(optional)</span>
                <textarea
                  name="message"
                  rows={2}
                  maxLength={2000}
                  placeholder="Tell us what you have in mind…"
                />
              </label>
              <div className="form-bottom">
                <p>
                  Your enquiry opens in your email app.
                  <br />
                  Or call <a href={contact.phoneHref}>{contact.phone}</a>.
                </p>
                <Action>Prepare enquiry</Action>
              </div>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}

export function CommunityDialog({
  community,
  onClose,
  onVisit,
}: {
  community: Community | null;
  onClose: () => void;
  onVisit: (name: string) => void;
}) {
  const { ref } = useDialog(!!community, onClose);
  return (
    <dialog
      ref={ref}
      className="community-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="community-dialog-title"
      data-lenis-prevent
    >
      {community && (
        <div className="community-dialog-grid">
          <button className="dialog-close" onClick={onClose} aria-label="Close community details">
            <X size={23} strokeWidth={1.2} />
          </button>
          <div className="community-dialog-image">
            <img
              src={community.detailImage}
              alt={`${community.name} ${community.id === "dates-county" ? "project visualization" : "landscape"}`}
            />
            <span>
              {community.id === "dates-county" ? "Project visualization" : "The Planet Green world"}
            </span>
          </div>
          <div className="community-dialog-content">
            <Eyebrow>{community.category}</Eyebrow>
            <h2 id="community-dialog-title">{community.name}</h2>
            <p>{community.detail}</p>
            <ul>
              {community.facts.map((fact) => (
                <li key={fact}>
                  <Check size={16} />
                  {fact}
                </li>
              ))}
            </ul>
            <Action
              onClick={() => {
                onClose();
                onVisit(community.name);
              }}
            >
              Get in touch
            </Action>
            <a className="text-link" href={community.url} target="_blank" rel="noreferrer">
              Visit the {community.name} website ↗
            </a>
          </div>
        </div>
      )}
    </dialog>
  );
}
