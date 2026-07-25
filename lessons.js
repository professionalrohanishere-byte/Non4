/* Lesson content — explained simply, with a real example and one action tip each */
const LESSONS = {
  communication: {
    label: "COMMUNICATION",
    icon: "◈",
    items: [
      {
        title: "Say it in one breath",
        simple: "If you can't explain your idea in one sentence, it's still fuzzy in your own head. A 5-year-old should be able to repeat it back to you.",
        example: "Not: 'We're building a synergistic platform for cross-vertical engagement.' Instead: 'We help shop owners text their customers when new stuff arrives.'",
        tip: "Write your idea in exactly one sentence, no commas that hide a second idea. If you can't, you don't understand it yet."
      },
      {
        title: "Listen more than you talk",
        simple: "Most people explain their idea and wait for praise. Smart people ask questions and wait for problems. The problems are the useful part.",
        example: "Instead of pitching for 10 minutes, ask a friend 'What would stop you from using this?' and just listen — don't defend, just take notes.",
        tip: "In your next conversation about your idea, ask 3 questions before you say anything about yourself."
      },
      {
        title: "Different people need different words",
        simple: "The way you explain your idea to an investor, a customer, and your mom should all sound different — because they care about different things.",
        example: "To a customer: 'This saves you 10 minutes a day.' To an investor: 'This has a 40% cheaper cost than the market leader.'",
        tip: "Write 3 versions of your one-sentence pitch: for a customer, for money-person, for a friend."
      }
    ]
  },
  product: {
    label: "PRODUCT",
    icon: "▲",
    items: [
      {
        title: "A product is a bridge",
        simple: "A product isn't a thing — it's a bridge between someone's annoying problem and them feeling relieved. If there's no annoying problem, there's no bridge needed.",
        example: "An umbrella isn't 'fabric on sticks.' It's a bridge between 'I'm getting wet' and 'I'm dry.'",
        tip: "Finish this sentence about your idea: 'Before, people had to ___. Now they don't.'"
      },
      {
        title: "Build the smallest useful thing first",
        simple: "You don't need every feature on day one. You need the smallest version that still solves the problem, so you can see if people actually want it.",
        example: "Before Uber had ratings, maps, and driver tiers, it was just: tap a button, a car shows up. That's it.",
        tip: "Cut your idea down to the ONE feature that, alone, would still make someone say 'yes I'd use that.'"
      },
      {
        title: "Features vs. benefits",
        simple: "A feature is what the thing does. A benefit is why anyone cares. People buy benefits, not features.",
        example: "Feature: '256GB storage.' Benefit: 'Never delete a photo again.'",
        tip: "List 3 features of your idea, then rewrite each one starting with 'so that you can...'"
      }
    ]
  },
  management: {
    label: "MANAGEMENT",
    icon: "⌖",
    items: [
      {
        title: "You can't manage what you can't see",
        simple: "Good management is just making problems visible early, before they get big and expensive. Hiding problems (from yourself or your team) is the real danger.",
        example: "A weekly 10-minute check-in where everyone says 'what's stuck' catches problems 3 weeks before they'd otherwise surface.",
        tip: "Pick one thing about your idea/business you've been avoiding checking on. Check it this week."
      },
      {
        title: "Delegate the task, not the decision",
        simple: "You can hand someone a task ('post 3 times a week'), but you still own the decision of what the business is trying to do. Don't confuse the two.",
        example: "You can pay someone to design a logo. You shouldn't outsource deciding what your business stands for.",
        tip: "List one task you're doing that isn't actually a decision — that's something you could hand off."
      },
      {
        title: "Systems beat willpower",
        simple: "Relying on 'I'll remember to do it' fails. A simple checklist, reminder, or routine doesn't need willpower — it just runs.",
        example: "Restaurants don't trust chefs to 'remember' food safety — they use checklists. That's why they're consistent.",
        tip: "Turn one thing you keep forgetting into a checklist or reminder instead of a promise to yourself."
      }
    ]
  },
  sales: {
    label: "SALES",
    icon: "✦",
    items: [
      {
        title: "Selling is just solving, out loud",
        simple: "Selling isn't tricking someone into buying. It's showing someone clearly that you understand their problem and have a real fix for it.",
        example: "'You mentioned you're always late replying to customers — this auto-replies for you in 2 seconds' isn't a sales trick, it's just true and specific.",
        tip: "Before you 'sell' next time, first say the customer's problem back to them in their own words."
      },
      {
        title: "People buy to solve a feeling",
        simple: "Nobody buys a product just for the product. They buy relief from worry, or a boost of pride, or saved time to relax. Find the feeling.",
        example: "People don't buy a gym membership for the machines. They buy it to feel in-control of their body.",
        tip: "Ask 3 people who show interest: 'What would change in your day if this worked?' Listen for the feeling word."
      },
      {
        title: "The first 'yes' is the hardest",
        simple: "Your very first customers are buying you, not your product — because you have no proof yet. Make it easy and low-risk for them.",
        example: "Offering 'try it free for a week, no card needed' removes the risk so the first yes is easy to get.",
        tip: "Design the smallest, safest possible way for someone to try your idea with zero risk."
      }
    ]
  },
  demand_supply: {
    label: "DEMAND & SUPPLY",
    icon: "✴",
    items: [
      {
        title: "Demand = how badly people want it",
        simple: "Demand isn't 'do people like it.' It's 'how many people, how badly, and how much would they pay.' Liking something and paying for it are very different.",
        example: "Lots of people 'like' the idea of a personal chef. Very few will actually pay for one. That gap matters.",
        tip: "Instead of asking 'do you like this idea?', ask 'would you pay $X for this today?' The second question is honest."
      },
      {
        title: "Supply is what it costs you to deliver",
        simple: "Supply is: can you actually make/deliver enough of this, reliably, without it costing more than people will pay?",
        example: "A bakery can sell 50 cakes a day happily, but if 5,000 people order in one day, supply (ovens, staff, time) breaks.",
        tip: "Write down the one resource (time, money, people) that would run out first if you suddenly got 100 customers."
      },
      {
        title: "Price sits where demand meets supply",
        simple: "If lots of people want something and few can supply it, price goes up. If everyone can supply it and few want it, price goes down. Your price tells you which side you're on.",
        example: "Bottled water at a store: cheap, tons of supply. Bottled water at a desert festival: expensive, demand spikes and supply is stuck.",
        tip: "Ask: is your idea more like 'store water' (common, low price) or 'desert water' (scarce, people need it now)? Be honest."
      }
    ]
  },
  money_psychology: {
    label: "PSYCHOLOGY OF MONEY",
    icon: "⎈",
    items: [
      {
        title: "People overvalue what they might lose",
        simple: "Losing $10 feels worse than gaining $10 feels good — even though it's the same amount. This is why 'free trial, cancel anytime' works better than 'buy now.'",
        example: "A gym that says 'you'll lose your discount if you don't join this week' works better than 'join and save.'",
        tip: "Reframe one part of your offer around what someone loses by waiting, not just what they gain by buying."
      },
      {
        title: "Free is a different emotion, not just a price",
        simple: "Dropping a price from $1 to $0 doesn't feel like '$1 less' — it feels like a completely different decision, almost no thinking involved.",
        example: "People will grab a free pen without a thought, but hesitate hard over a 10-cent pen. Zero has its own gravity.",
        tip: "Consider if a free, tiny version of your idea (not a discount — actually free) could remove the hesitation for new users."
      },
      {
        title: "Money spent on relief feels different than money spent on wants",
        simple: "People pay fast, with little regret, for things that remove pain (a leaking pipe fixed). They think much longer about things that are just 'nice to have.'",
        example: "You'll pay a plumber same-day without blinking. You'll 'think about it' for two weeks before buying a nice jacket.",
        tip: "Be honest: is your idea removing real pain, or is it a 'nice to have'? Pain-removers sell faster and need less convincing."
      }
    ]
  }
};
