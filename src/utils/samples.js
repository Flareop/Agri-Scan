/* Sample photos, for the visitor who has no crop leaf to hand.

   This is the difference between a demo and a screenshot. Most people meeting
   AgriScan are at a desk, on a phone in a city, or reading about it on someone
   else's site — and a dropzone is a locked door to all of them. One click on a
   real photo is the whole product in ten seconds.

   Empty by default, and the row does not render while it is empty, so this
   ships harmlessly before the photographs exist.

   ---------------------------------------------------------------- ADDING ONE
   Drop a .jpg in public/samples/ and add an entry here. Keep them small —
   they are fetched on click and then resized client-side anyway, so anything
   past ~1200px on the long edge is wasted bytes.

     { src: '/samples/tomato-early-blight.jpg',
       label: 'Early blight',
       note: 'Tomato' }

   `label` is what the button reads. `note` is the quieter second line, for the
   crop or any context — keep both short, they sit in a row on a phone.

   Pick three that make an argument, not three that are easy:
     1. an obviously healthy leaf     — proves it does not cry disease at
                                        everything, which is the first thing a
                                        sceptic tests
     2. an unmistakable infection     — the clean win
     3. something genuinely ambiguous — early-stage, poor light, partial leaf.
                                        A model that answers this one with
                                        visible uncertainty is far more
                                        convincing than three confident hits,
                                        because it shows the confidence score
                                        means something.

   Licensing matters here: these ship on a commercial site. Use photographs you
   took, or ones under a licence that permits commercial use, and record the
   source in public/samples/CREDITS.md. */

export const SAMPLES = []
