"use client";
import { useState } from "react";
import { Action } from "./ui";
/** Static-export contact flow: prepare an email, never claim a server submission. */
export function PageEnquiry() {
  const [draft, setDraft] = useState("");
  function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone")}\n\n${data.get("message")}`;
    setDraft(
      `mailto:marketing@planetgreen.co.in?subject=${encodeURIComponent(String(data.get("subject") || "Planet Green enquiry"))}&body=${encodeURIComponent(body)}`,
    );
  }
  return (
    <form className="enquiry-form page-enquiry" onSubmit={prepare}>
      <div className="form-row">
        <label>
          Your Name
          <input name="name" required autoComplete="name" maxLength={100} />
        </label>
        <label>
          Email Address
          <input type="email" name="email" required autoComplete="email" maxLength={150} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Phone
          <input type="tel" name="phone" required autoComplete="tel" maxLength={30} />
        </label>
        <label>
          Subject
          <input name="subject" maxLength={200} />
        </label>
      </div>
      <label>
        Write a Comment
        <textarea name="message" rows={4} maxLength={3000} />
      </label>
      <p className="enquiry-note">Prepare your message, then open your email app to send it.</p>
      {draft ? (
        <div className="page-enquiry-ready">
          <Action href={draft}>Open email draft</Action>
          <button type="button" className="text-button" onClick={() => setDraft("")}>
            Edit message
          </button>
        </div>
      ) : (
        <Action>Prepare message</Action>
      )}
    </form>
  );
}
