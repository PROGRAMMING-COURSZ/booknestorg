import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const booksDir = path.resolve('public', 'books');
if (!fs.existsSync(booksDir)) {
  fs.mkdirSync(booksDir, { recursive: true });
}

// Helper to draw wrapped text
function drawWrappedText(page, text, { x, y, maxWidth, lineHeight, font, size, color }) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + (line === '' ? '' : ' ') + words[n];
    const testWidth = font.widthOfTextAtSize(testLine, size);
    if (testWidth > maxWidth && n > 0) {
      page.drawText(line, { x, y: currentY, size, font, color });
      line = words[n];
      currentY -= lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.length > 0) {
    page.drawText(line, { x, y: currentY, size, font, color });
    currentY -= lineHeight;
  }
  return currentY;
}

// Helper to draw a decorative cover page
function drawCover(page, { title, subtitle, author, genre, primaryColor, secondaryColor, fontBold, fontRegular, fontItalic }) {
  const { width, height } = page.getSize();
  
  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: primaryColor,
  });

  // Inner border
  page.drawRectangle({
    x: 36,
    y: 36,
    width: width - 72,
    height: height - 72,
    borderColor: secondaryColor,
    borderWidth: 2,
    color: primaryColor,
  });

  // Second inner decorative accent border
  page.drawRectangle({
    x: 44,
    y: 44,
    width: width - 88,
    height: height - 88,
    borderColor: secondaryColor,
    borderWidth: 0.75,
  });

  // Genre badge
  const genreText = genre.toUpperCase();
  const genreWidth = fontBold.widthOfTextAtSize(genreText, 10);
  page.drawText(genreText, {
    x: (width - genreWidth) / 2,
    y: height - 120,
    size: 10,
    font: fontBold,
    color: secondaryColor,
  });

  // Title
  const titleWords = title.split(' ');
  let titleY = height - 240;
  for (const line of title.split('\n')) {
    const titleWidth = fontBold.widthOfTextAtSize(line, 28);
    page.drawText(line, {
      x: (width - titleWidth) / 2,
      y: titleY,
      size: 28,
      font: fontBold,
      color: secondaryColor,
    });
    titleY -= 36;
  }

  // Decorative divider
  page.drawLine({
    start: { x: width / 2 - 40, y: titleY - 10 },
    end: { x: width / 2 + 40, y: titleY - 10 },
    thickness: 1.5,
    color: secondaryColor,
  });

  // Subtitle
  const subWidth = fontItalic.widthOfTextAtSize(subtitle, 13);
  page.drawText(subtitle, {
    x: (width - subWidth) / 2,
    y: titleY - 40,
    size: 13,
    font: fontItalic,
    color: rgb(0.85, 0.85, 0.85),
  });

  // Author
  const authorPrefix = 'A Story by';
  const prefixWidth = fontRegular.widthOfTextAtSize(authorPrefix, 11);
  page.drawText(authorPrefix, {
    x: (width - prefixWidth) / 2,
    y: 130,
    size: 11,
    font: fontRegular,
    color: rgb(0.75, 0.75, 0.75),
  });

  const authorWidth = fontBold.widthOfTextAtSize(author, 18);
  page.drawText(author, {
    x: (width - authorWidth) / 2,
    y: 100,
    size: 18,
    font: fontBold,
    color: secondaryColor,
  });

  const imprint = "BookNest Edition • Collector's Series";
  const impWidth = fontRegular.widthOfTextAtSize(imprint, 9);
  page.drawText(imprint, {
    x: (width - impWidth) / 2,
    y: 60,
    size: 9,
    font: fontRegular,
    color: rgb(0.6, 0.6, 0.6),
  });
}

// Function to draw content page
function drawContentPage(page, { chapterNumber, chapterTitle, paragraphs, pageNum, totalPages, fontBold, fontRegular, fontItalic }) {
  const { width, height } = page.getSize();

  // Page frame / margin
  const margin = 54;
  const contentWidth = width - margin * 2;

  // Running header
  const headerText = 'THE LITTLE BOOKSHOP';
  page.drawText(headerText, {
    x: margin,
    y: height - 40,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.45, 0.4),
  });

  page.drawLine({
    start: { x: margin, y: height - 46 },
    end: { x: width - margin, y: height - 46 },
    thickness: 0.5,
    color: rgb(0.8, 0.78, 0.75),
  });

  let curY = height - 80;

  if (chapterNumber && chapterTitle) {
    const chNum = `CHAPTER ${chapterNumber}`;
    page.drawText(chNum, {
      x: margin,
      y: curY,
      size: 10,
      font: fontBold,
      color: rgb(0.6, 0.4, 0.2),
    });
    curY -= 20;

    page.drawText(chapterTitle, {
      x: margin,
      y: curY,
      size: 18,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.15),
    });
    curY -= 36;
  }

  // Paragraphs
  for (const p of paragraphs) {
    curY = drawWrappedText(page, p, {
      x: margin,
      y: curY,
      maxWidth: contentWidth,
      lineHeight: 18,
      font: fontRegular,
      size: 11,
      color: rgb(0.2, 0.2, 0.2),
    });
    curY -= 12; // spacing between paragraphs
  }

  // Running footer / page number
  const pageStr = `${pageNum}`;
  const pageStrWidth = fontRegular.widthOfTextAtSize(pageStr, 9);
  page.drawText(pageStr, {
    x: (width - pageStrWidth) / 2,
    y: 35,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });
}

async function createLittleBookshop() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('The Little Bookshop');
  pdfDoc.setAuthor('Clara Bell');
  pdfDoc.setSubject('A cozy story about a student discovering a hidden book haven');
  pdfDoc.setProducer('BookNest Static Library Engine');

  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // Page 1: Cover
  const coverPage = pdfDoc.addPage([400, 600]);
  drawCover(coverPage, {
    title: 'The Little\nBookshop',
    subtitle: 'A Tale of Rain, Warm Tea, and Forgotten Pages',
    author: 'Clara Bell',
    genre: 'Cozy Fiction',
    primaryColor: rgb(0.12, 0.22, 0.2), // Forest deep emerald
    secondaryColor: rgb(0.96, 0.88, 0.72), // Warm soft gold/cream
    fontBold,
    fontRegular,
    fontItalic,
  });

  // Page 2: Chapter 1
  const page2 = pdfDoc.addPage([400, 600]);
  drawContentPage(page2, {
    chapterNumber: 'I',
    chapterTitle: 'The Bell on Pine Street',
    paragraphs: [
      'The rain began as a tentative mist over the cobblestones, gradually thickening into a steady rhythm against the shopfront awnings. Elena pulled her knitted scarf closer around her collar and hurried past the bakeries and flower carts.',
      'Tucked between an antique clockmaker and a shuttered teahouse stood a shop she had never noticed before. A weathered wooden sign swung gently in the breeze: "The Starlight Bookshop — Curiosities & Lost Tales."',
      'Above the door hung a small brass bell that produced a clear, melodic chime as Elena pushed the heavy oak entrance inward. The air inside smelled instantly of aged paper, polished cedar, dried lavender, and the faint comforting aroma of steeped chamomile tea.'
    ],
    pageNum: 2,
    totalPages: 5,
    fontBold,
    fontRegular,
    fontItalic
  });

  // Page 3: Chapter 1 cont.
  const page3 = pdfDoc.addPage([400, 600]);
  drawContentPage(page3, {
    paragraphs: [
      'Towering shelves reached up toward timber-beamed ceilings, their rows lined with books bound in linen, gold-stamped leather, and deep velvet ribbons. Rolling wooden ladders leaned against the stacks, inviting curious hands to climb toward forgotten worlds.',
      'Behind a counter adorned with stacks of parchment sat an elderly man with silver-rimmed spectacles, peering up with warm, crinkling eyes. "Welcome in out of the storm," he said with a gentle smile. "Take all the time you need. The right book always finds its reader on rainy afternoons."',
      'Elena wandered down the narrow aisle marked with handwritten placards: Astronomy, Forgotten Folklore, Island Histories, and Botanical Sketches. In a quiet alcove by a bay window, rain droplets trickled down the glass, casting gentle ripples of light across an open table.'
    ],
    pageNum: 3,
    totalPages: 5,
    fontBold,
    fontRegular,
    fontItalic
  });

  // Page 4: Chapter 2
  const page4 = pdfDoc.addPage([400, 600]);
  drawContentPage(page4, {
    chapterNumber: 'II',
    chapterTitle: 'The Map of Hidden Stars',
    paragraphs: [
      'On the third shelf from the window rested a slender volume bound in midnight blue cloth with constellations embossed in faint silver foil. When Elena lifted it, a handwritten note slipped from between the pages: "For those who search in quiet hours."',
      'She opened to the first chapter. The prose was handwritten in elegant dark ink, detailing journeys across mountain passes, stargazing diaries from northern observatories, and recipes for herbal teas brewed beside crackling hearths.',
      'For two hours, the world outside ceased to exist. The distant rumble of thunder only deepened the cozy shelter of the bookshop. Elena realized that some places do not simply store books—they hold memories and peace for tired souls.'
    ],
    pageNum: 4,
    totalPages: 5,
    fontBold,
    fontRegular,
    fontItalic
  });

  // Page 5: Epilogue
  const page5 = pdfDoc.addPage([400, 600]);
  drawContentPage(page5, {
    chapterNumber: 'III',
    chapterTitle: 'A Haven in the City',
    paragraphs: [
      'As evening descended, the bookstore keeper lit a series of small amber lanterns along the upper gallery. The shop glowed with a warmth that seemed entirely separate from the brisk autumn chill outside.',
      '"You found a good companion for the evening," the keeper said as Elena brought the blue volume to the register. He stamped the inside cover with an ornate wax seal.',
      'Walking back into the city evening under the cleared sky of stars, Elena held the book tightly in her bag. She knew that whenever life grew too loud, the little bookshop with its chime and cedar shelves would be waiting.'
    ],
    pageNum: 5,
    totalPages: 5,
    fontBold,
    fontRegular,
    fontItalic
  });

  const pdfBytes = await pdfDoc.save();
  // Save as demo_book.pdf and also the_little_bookshop.pdf
  fs.writeFileSync(path.join(booksDir, 'demo_book.pdf'), pdfBytes);
  fs.writeFileSync(path.join(booksDir, 'the_little_bookshop.pdf'), pdfBytes);
  console.log('Created demo_book.pdf and the_little_bookshop.pdf');
}

async function createStarlightChronicles() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('The Starlight Chronicles');
  pdfDoc.setAuthor('Julian Moore');
  pdfDoc.setSubject('Essays on Night Skies and Wonder');

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const coverPage = pdfDoc.addPage([400, 600]);
  drawCover(coverPage, {
    title: 'The Starlight\nChronicles',
    subtitle: 'Observations on Night Skies, Constellations & Wonder',
    author: 'Julian Moore',
    genre: 'Nature & Science',
    primaryColor: rgb(0.1, 0.14, 0.28), // Midnight navy
    secondaryColor: rgb(0.95, 0.85, 0.6), // Starlight golden
    fontBold,
    fontRegular,
    fontItalic,
  });

  const page2 = pdfDoc.addPage([400, 600]);
  drawContentPage(page2, {
    chapterNumber: 'I',
    chapterTitle: 'Looking Up into the Quiet',
    paragraphs: [
      'To look into a clear night sky is to step outside the narrow urgency of our daily routines. When artificial city lights fade behind the hills, the true scale of the universe unfolds in quiet majesty.',
      'Ancient navigators read these celestial arrangements like road maps across trackless oceans. Each cluster of distant stars carried stories of heroes, mythical beasts, and enduring promises.',
      'In our modern era of screens and constant notifications, taking fifteen minutes to stand in the stillness of dusk and watch the first evening star emerge remains one of the simplest and most restorative rituals available to human beings.'
    ],
    pageNum: 2,
    totalPages: 3,
    fontBold,
    fontRegular,
    fontItalic
  });

  const page3 = pdfDoc.addPage([400, 600]);
  drawContentPage(page3, {
    chapterNumber: 'II',
    chapterTitle: 'The Astronomy of Calm',
    paragraphs: [
      'Modern astronomy teaches us that every atom in our hands was once forged inside ancient stellar furnaces. We are not separate from the cosmos; we are part of its continuing unfolding.',
      'Whether through a brass telescope on a breezy rooftop or simply lying on a wool blanket in an open field, observing the constellations re-anchors our sense of wonder.',
      'May this guide inspire you to step outside tonight, breathe in the cool night air, and discover the quiet brilliance waiting overhead.'
    ],
    pageNum: 3,
    totalPages: 3,
    fontBold,
    fontRegular,
    fontItalic
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(booksDir, 'starlight_chronicles.pdf'), pdfBytes);
  console.log('Created starlight_chronicles.pdf');
}

async function createTeaGardenGuide() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('The Cozy Tea Garden Guide');
  pdfDoc.setAuthor('Mei Lin');
  pdfDoc.setSubject('A gentle handbook on herbs, brewing traditions, and mindful moments');

  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const coverPage = pdfDoc.addPage([400, 600]);
  drawCover(coverPage, {
    title: 'The Cozy Tea\nGarden Guide',
    subtitle: 'Herbal Infusions, Mindful Brewing & Gentle Rituals',
    author: 'Mei Lin',
    genre: 'Lifestyle & Mind',
    primaryColor: rgb(0.24, 0.18, 0.28), // Soft plum / botanical mauve
    secondaryColor: rgb(0.96, 0.9, 0.82), // Warm petal cream
    fontBold,
    fontRegular,
    fontItalic,
  });

  const page2 = pdfDoc.addPage([400, 600]);
  drawContentPage(page2, {
    chapterNumber: 'I',
    chapterTitle: 'The Ceremony of Slowing Down',
    paragraphs: [
      'Brewing a cup of loose-leaf tea is an invitation to pause. From the moment water begins to simmer in the kettle to the slow unfurling of dried leaves in porcelain, every step encourages gentle patience.',
      'Herbal traditions throughout history have celebrated chamomile for evening tranquility, fresh mint for morning clarity, and roasted barley for afternoon comfort.',
      'Creating a small tea sanctuary at your desk or reading chair transforms an ordinary study break into an intentional moment of renewal.'
    ],
    pageNum: 2,
    totalPages: 3,
    fontBold,
    fontRegular,
    fontItalic
  });

  const page3 = pdfDoc.addPage([400, 600]);
  drawContentPage(page3, {
    chapterNumber: 'II',
    chapterTitle: 'Pairings for Quiet Reading',
    paragraphs: [
      'For cozy fiction and poetry: a blend of French lavender, sweet chamomile, and honeybush.',
      'For deep study and morning research: whole-leaf green Sencha with a touch of crushed cardamom and lemon peel.',
      'Let your tea steam gently beside your open book, warming your hands between every turned page.'
    ],
    pageNum: 3,
    totalPages: 3,
    fontBold,
    fontRegular,
    fontItalic
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(booksDir, 'the_cozy_tea_garden.pdf'), pdfBytes);
  console.log('Created the_cozy_tea_garden.pdf');
}

async function createAtomicHabitsDemo() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('Atomic Habits & Daily Focus');
  pdfDoc.setAuthor('James Clear & Studio Notes');
  pdfDoc.setSubject('Practical strategies for building tiny routines that yield remarkable outcomes');

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const coverPage = pdfDoc.addPage([400, 600]);
  drawCover(coverPage, {
    title: 'Atomic Habits\n& Daily Focus',
    subtitle: 'Tiny Changes, Remarkable Results for Lifelong Readers',
    author: 'James Clear (Study Guide)',
    genre: 'Personal Growth',
    primaryColor: rgb(0.28, 0.16, 0.12), // Warm terracotta / mahogany
    secondaryColor: rgb(0.98, 0.92, 0.8), // Amber cream
    fontBold,
    fontRegular,
    fontItalic,
  });

  const page2 = pdfDoc.addPage([400, 600]);
  drawContentPage(page2, {
    chapterNumber: 'I',
    chapterTitle: 'The Power of 1% Improvement',
    paragraphs: [
      'It is so easy to overestimate the importance of one defining moment and underestimate the value of making small improvements on a daily basis. Getting 1 percent better each day adds up to massive gains over the course of a single year.',
      'Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your daily habits multiply as you repeat them.',
      'If you read just ten pages every single morning with your coffee, you will complete over fifteen full books every year without ever sacrificing your evenings.'
    ],
    pageNum: 2,
    totalPages: 3,
    fontBold,
    fontRegular,
    fontItalic
  });

  const page3 = pdfDoc.addPage([400, 600]);
  drawContentPage(page3, {
    chapterNumber: 'II',
    chapterTitle: 'Designing Your Reading Environment',
    paragraphs: [
      'Environment is the invisible hand that shapes human behavior. Make the cues of good habits obvious in your living and study spaces.',
      'Place your current book directly onto your desk or nightstand. Keep a dedicated reading lamp and a comfortable bookmark ready.',
      'When your environment is designed for effortless focus, good reading habits become the path of least resistance.'
    ],
    pageNum: 3,
    totalPages: 3,
    fontBold,
    fontRegular,
    fontItalic
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(booksDir, 'atomic_habits_focus.pdf'), pdfBytes);
  console.log('Created atomic_habits_focus.pdf');
}

async function run() {
  await createLittleBookshop();
  await createStarlightChronicles();
  await createTeaGardenGuide();
  await createAtomicHabitsDemo();
  console.log('All sample books successfully generated!');
}

run().catch(console.error);
