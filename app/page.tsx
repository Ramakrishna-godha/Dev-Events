import EventsCard from "@/components/EventsCard";
import ExploreBtn from "@/components/ExploreBtn";
import { events } from "@/lib/constants";

const page = () => {
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br />
        Event You Can't Miss
      </h1>
      <p className="text-center mt-5">
        Hackthons, Conferences,and Meetups, All in One Place
      </p>
      <ExploreBtn />
      <div className="mt-20 space-y-7">
        {/* Events Section */}
        <h3>Featured Events</h3>

        <ul className="events list-none">
          {events.map((event) => (
            <li
              key={event.title}
              className="event-card bg-green-700/5 border border-green-700/20 rounded-lg p-4"
            >
              <EventsCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default page;
