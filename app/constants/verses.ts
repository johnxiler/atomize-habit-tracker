export interface Verse {
    text: string;
    ref: string;
}

const VERSES: Verse[] = [
    { text: "For I know the plans I have for you, declares the Lord.", ref: "Jeremiah 29:11" },
    { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
    { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
    { text: "He leads me beside still waters. He restores my soul.", ref: "Psalm 23:2-3" },
    { text: "Even though I walk through the valley of the shadow of death, I will fear no evil.", ref: "Psalm 23:4" },
    { text: "No weapon formed against you shall prosper.", ref: "Isaiah 54:17" },
    { text: "He who dwells in the shelter of the Most High will rest in the shadow of the Almighty.", ref: "Psalm 91:1" },
    { text: "A thousand may fall at your side... but it will not come near you.", ref: "Psalm 91:7" },
    { text: "Be strong and courageous. Do not be afraid.", ref: "Joshua 1:9" },
    { text: "Trust in the Lord with all your heart.", ref: "Proverbs 3:5" },
    { text: "Love is patient, love is kind.", ref: "1 Corinthians 13:4" },
    { text: "Rejoice in the Lord always; again I will say, rejoice.", ref: "Philippians 4:4" },
    { text: "God is our refuge and strength, an ever-present help in trouble.", ref: "Psalm 46:1" },
];

export function getVerseOfTheDay() {
    const day = new Date().getDate();
    return VERSES[day % VERSES.length];
}

export function getVerseForTitle(title: string): Verse {
    const lowerTitle = title.toLowerCase();

    // Try to find a specific book/reference match
    const match = VERSES.find(v => {
        const refParts = v.ref.toLowerCase().split(' ');
        const book = refParts[0]; // e.g., 'psalm'
        const chapter = refParts[1]?.split(':')[0]; // e.g., '23'

        // Match both book and chapter if possible
        if (lowerTitle.includes(book)) {
            if (chapter && lowerTitle.includes(chapter)) return true;
            return true; // Match just book as backup
        }
        return false;
    });

    if (match) return match;

    // Default to a consistent daily verse if no title match
    return getVerseOfTheDay();
}
