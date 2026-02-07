import PageContainer from "@/components/PageContainer";
import { getBooksData } from "@/lib/data/books";
import BookGridClient from "./BookGridClient";

// Revalidate this page every 5 minutes
export const revalidate = 300;

export default async function LawDocumentsPage() {
  // Fetch data on the server with caching
  const { categories, books } = await getBooksData();

  return (
    <PageContainer>
      {/* Pass server data to client component for interactivity */}
      <BookGridClient 
        categories={categories} 
        books={books} 
      />
    </PageContainer>
  );
}
