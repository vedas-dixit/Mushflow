import Card from "../cards/Card";

function CardBox() {
  const dummyCards = [
    {
      id: 1,
      title: "Meeting Notes for Project X",
      content: [
        "Review project timeline",
        "Discuss resource allocation",
        "Set up weekly check-ins",
        "Plan for Q2 deliverables",
        "Infrastructure upgrades needed",
        "Budget review for new tools"
      ],
      priority: "high",
      color: "bg-neutral-800",
      pinned: true,
      completed: false,
      dueDate: "2025-02-28T23:59:59.000Z"
    },
    {
      id: 2,
      title: "Shopping List",
      content: [
        "Groceries",
        "Office supplies"
      ],
      priority: "medium",
      color: "bg-sky-950",
      pinned: false,
      completed: true,
      dueDate: null
    },
    {
      id: 3,
      title: "Ideas for Blog Post",
      content: [
        "Top 10 productivity tips",
        "How to stay organized",
        "Best tools for remote work",
        "Time management strategies"
      ],
      priority: "low",
      color: "bg-stone-800",
      pinned: false,
      completed: false,
      dueDate: "2025-03-05T12:00:00.000Z"
    },
    {
      id: 4,
      title: "Daily Workout Routine",
      content: ["30 mins cardio", "Push-ups"],
      priority: "medium",
      color: "bg-emerald-950",
      pinned: true,
      completed: false,
      dueDate: "2025-02-24T08:00:00.000Z"
    },
    {
      id: 5,
      title: "Book Notes: The Psychology of Money",
      content: [
        "Chapter 1: People make financial decisions based on their personal history",
        "Chapter 2: Luck and risk are important factors in success",
        "Chapter 3: Compounding is a powerful force",
        "Chapter 4: Nothing is free in investing",
        "Chapter 5: Being wealthy and being rich are different things",
        "Key takeaways: Focus on long-term thinking",
        "Important quotes to remember",
        "Questions for discussion group",
        "Related books to read next"
      ],
      priority: "low",
      color: "bg-violet-950",
      pinned: false,
      completed: false,
      dueDate: null
    },
    {
      id: 6,
      title: "Quick Reminder",
      content: ["Call mom"],
      priority: "high",
      color: "bg-rose-950",
      pinned: true,
      completed: false,
      dueDate: "2025-02-23T18:00:00.000Z"
    },
    {
      id: 7,
      title: "Project Brainstorm",
      content: [
        "Mobile app features",
        "User authentication flow",
        "Database schema",
        "API endpoints",
        "Testing strategy",
        "Deployment pipeline"
      ],
      priority: "high",
      color: "bg-amber-950",
      pinned: false,
      completed: false,
      dueDate: "2025-03-10T23:59:59.000Z"
    },
    {
      id: 8,
      title: "Travel Packing List",
      content: [
        "Passport",
        "Chargers",
        "Laptop",
        "Toiletries",
        "Medications",
        "Camera",
        "Travel adapter",
        "Comfortable shoes",
        "Weather-appropriate clothing",
        "First aid kit",
        "Travel insurance documents",
        "Hotel reservations",
        "Flight tickets",
        "Local currency"
      ],
      priority: "medium",
      color: "bg-indigo-950",
      pinned: true,
      completed: false,
      dueDate: "2025-04-01T10:00:00.000Z"
    },
    {
      id: 9,
      title: "Recipe: Chocolate Cake",
      content: [
        "2 cups flour",
        "2 cups sugar",
        "3/4 cup cocoa powder",
        "2 teaspoons baking soda",
        "1 teaspoon salt",
        "2 eggs",
        "1 cup milk",
        "1/2 cup vegetable oil",
        "2 teaspoons vanilla extract",
        "1 cup boiling water",
        "Bake at 350°F for 30-35 minutes"
      ],
      priority: "low",
      color: "bg-neutral-800",
      pinned: false,
      completed: false,
      dueDate: null
    },
    {
      id: 10,
      title: "Home Maintenance",
      content: [
        "Change air filters",
        "Clean gutters",
        "Check smoke detectors"
      ],
      priority: "medium",
      color: "bg-cyan-950",
      pinned: false,
      completed: true,
      dueDate: "2025-02-20T23:59:59.000Z"
    },
    {
      id: 11,
      title: "Language Learning Goals",
      content: ["Learn 5 new words daily", "Practice speaking"],
      priority: "low",
      color: "bg-teal-950",
      pinned: false,
      completed: false,
      dueDate: null
    },
    {
      id: 12,
      title: "Movie Watchlist",
      content: [
        "The Shawshank Redemption",
        "Inception",
        "The Dark Knight",
        "Pulp Fiction",
        "The Godfather",
        "Forrest Gump",
        "The Matrix",
        "Goodfellas",
        "The Lord of the Rings trilogy",
        "Fight Club",
        "The Silence of the Lambs",
        "Saving Private Ryan"
      ],
      priority: "low",
      color: "bg-fuchsia-950",
      pinned: false,
      completed: false,
      dueDate: null
    }
  ];


  return (
    <div className="w-full h-full pl-16 px-4 mt-2 flex justify-center">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
        {dummyCards.map((card) => (
          <div key={card.id} className="break-inside-avoid">
            <Card
              title={card.title}
              content={card.content}
              priority={card.priority}
              color={card.color}
              pinned={card.pinned}
              dueDate={card.dueDate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardBox;