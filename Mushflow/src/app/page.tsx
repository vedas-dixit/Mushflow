import { getServerSession } from "next-auth";
import HomePage from "@/components/homepage/HomePage";
import { getTasks } from "@/utils/serverActions";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  // Get the user session
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || "anonymous";
  
  try {
    // Fetch tasks server-side
    console.log(`Fetching tasks for user: ${userId}`);
    const tasks = await getTasks(userId);
    console.log(`Successfully fetched ${tasks.length} tasks`);
    
    return <HomePage tasks={tasks} />;
  } catch (error) {
    console.error("Error in Home page:", error);
    // Return the HomePage with an empty tasks array in case of error
    return <HomePage tasks={[]} />;
  }
}
