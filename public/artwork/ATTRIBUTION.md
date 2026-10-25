# Artwork notes

## Added in this update

- track-artwork-placeholder.svg is an original, locally authored Pulsewave placeholder. It was not copied from an external source and has no third-party attribution requirement.

Several sample-track covers in musicData.js were soft, low-resolution crops and their exact album-art matches and redistribution rights could not be verified. The sample data now leaves those covers unset so the application uses the neutral placeholder instead of presenting uncertain images as official artwork. Ishqa Ve already had no cover assigned in the track data; its separate 70 x 70 image was not selected as official artwork.

The old track and queue PNG files remain in public/artwork for compatibility with the existing asset tree, but the sample music data no longer references them. The promotional now-playing-video.png image is also unused and is not selected as track artwork.

Imported local tracks continue to use embedded ID3 APIC/PIC cover art when present. When imported files have no readable artwork, they use the same placeholder.

## Existing assets retained

Existing playlist, library, shortcut, station, and profile images were reviewed and retained. This update does not add remotely hosted images or redistribute third-party imagery. The provenance of some pre-existing assets is not documented in the project.
