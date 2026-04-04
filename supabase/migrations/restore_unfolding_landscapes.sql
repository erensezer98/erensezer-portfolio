-- Recovery: Re-insert Unfolding Landscapes project
-- Run this in the Supabase SQL Editor if the project was accidentally deleted.

INSERT INTO projects (title, slug, category, short_description, description, year, location, tags, cover_image, images, featured, order_index) VALUES
(
  'Unfolding Landscapes',
  'unfolding-landscapes',
  'competition',
  'Protective roof encircling Roman ruins in Calabria, creating a dialogue between archaeological and environmental landscapes.',
  'The objective of the proposal for the reuse of the Thermae of Curinga is to understand the impact and interaction between the archaeological and environmental landscapes of Curinga and to devise a design solution that allows both landscapes to coexist harmoniously.

This interaction is symbolized by a singular roof element that encircles the entire perimeter of the ruins for protection. Additionally, this roof serves as a roof for a walkway beneath it, providing users with a panoramic view of the ruins, while a singular passage has been incorporated to allow a transversal journey through the ruins for a more direct internal experience. The priority has been given to establishing a seamless external and internal experience for users within this archaeological landscape, simultaneously fostering an appreciation for the environmental landscape of Curinga.

As for the design, the roof follows a language extracted from the movement of both the topography around the ruins and the ruins themselves. The movement of the topography solely depends on the levels and layers, while the movement of the ruins depends on the spaces that need to be focused on, framing certain views to be highlighted from the outside, such as the frigidarium. With this organic movement mimicking the environmental landscape, the roof creates a camouflage effect for the ruins, protecting and adapting them to the land, yet it also gives some hints and mystery for the ruins from the outside.

In addition to the dialogue between the landscapes, the structure draws inspiration from the architectural identity of the ruins. It is designed with a starting point from a central cross vault, historically noted as the roofing for the central room of the bath, the frigidarium. In terms of materiality, the entire roof is made of clay, paying homage to the Roman African construction techniques, specifically the use of clay in pottery.',
  2023,
  'Curinga, Calabria, Italy',
  ARRAY['archaeology', 'ruins', 'landscape', 'roof', 'competition', 'Roman', 'Calabria', 'clay', 'thermae'],
  'https://lh3.googleusercontent.com/d/PLACEHOLDER_UNFOLDING_COVER',
  ARRAY[
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_UNFOLDING_GALLERY_1',
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_UNFOLDING_GALLERY_2',
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_UNFOLDING_GALLERY_3'
  ],
  true,
  6
);
