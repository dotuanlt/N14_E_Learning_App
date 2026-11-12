import { useEffect } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { WebView } from 'react-native-webview';

type Props = {
  url: string;
  height?: number;
  autoPlay?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  return match ? match[1] : null;
}

function DirectVideoPlayer({ url, autoPlay }: { url: string; autoPlay: boolean }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    if (autoPlay) {
      p.play();
    }
  });

  useEffect(() => {
    try {
      player.replace(url);
      if (autoPlay) {
        player.play();
      }
    } catch {
      // ignore if player is not ready
    }
  }, [url, autoPlay, player]);

  return (
    <VideoView
      style={StyleSheet.absoluteFill}
      player={player}
      allowsPictureInPicture
    />
  );
}

export function SmartVideoPlayer({ url, height = 200, autoPlay = false, style }: Props) {
  const youtubeId = extractYouTubeId(url);

  if (youtubeId) {
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?rel=0&playsinline=1${autoPlay ? '&autoplay=1' : ''}`;

    return (
      <View style={[styles.container, { height }, style]}>
        {Platform.OS === 'web' ? (
          <iframe
            src={embedUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Course Video Player"
          />
        ) : (
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={!autoPlay}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
          />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }, style]}>
      <DirectVideoPlayer url={url} autoPlay={autoPlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
});
