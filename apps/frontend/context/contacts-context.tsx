"use client";

import { createContext, useContext, useState } from "react";

export interface Contact {
  name: string;
  phone: string;
  status: "pending" | "sending" | "sent" | "error";
}

interface ContactsContextProps {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  clearContacts: () => void;
}

const ContactsContext = createContext<ContactsContextProps | undefined>(
  undefined,
);

export const ContactsProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const [contacts, setContactsState] = useState<Contact[]>([]);

  const setContacts = (contacts: Contact[]) => {
    setContactsState(contacts);
  };

  const clearContacts = () => {
    setContactsState([]);
  };

  return (
    <ContactsContext.Provider value={{ contacts, setContacts, clearContacts }}>
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }
  return context;
};
