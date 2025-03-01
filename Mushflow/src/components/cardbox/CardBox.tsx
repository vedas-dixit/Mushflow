import Card from "../cards/Card";
import { dummyCards } from "@/utils/usePlaceholdertext";
function CardBox() {

  return (
    <div className="w-full h-full pl-16 px-4 mt-28 flex justify-center">
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