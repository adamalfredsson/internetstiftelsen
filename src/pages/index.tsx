import { Inter } from "next/font/google";
import { FormEvent, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<{
    answer: string;
    sources: any[];
  }>();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setResponse({ answer: "...", sources: [] });
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      setResponse(data);
    } catch (error) {
      setResponse({ answer: "Ooooops, något gick fel", sources: [] });
    }
  };

  return (
    <main
      className={`min-h-screen container mx-auto p-4 flex flex-col justify-between ${inter.className}`}
    >
      <div className="text-red">{response?.answer}</div>
      <div className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2">
          {response?.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank">
                <div className="py-2 group">
                  <h2 className="font-bold group-hover:underline">
                    {source.title}
                  </h2>
                  <p className="text-sm line-clamp-3">{source.content}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
        <form onSubmit={submit} className="flex flex-col gap-8">
          <textarea
            className="text-black h-24"
            placeholder="Fråga"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" className="bg-slate-500 p-4">
            Skicka
          </button>
        </form>
      </div>
    </main>
  );
}
