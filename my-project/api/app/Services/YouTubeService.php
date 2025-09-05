<?php

namespace App\Services;

use Exception;

class YouTubeService
{
    /**
     * Extract video information from YouTube URL
     */
    public function extractVideoInfo(string $url): array
    {
        $videoId = $this->extractVideoId($url);
        
        if (!$videoId) {
            throw new Exception('Invalid YouTube URL');
        }

        return $this->getVideoInfo($videoId);
    }

    /**
     * Extract video ID from YouTube URL
     */
    private function extractVideoId(string $url): ?string
    {
        $patterns = [
            '/youtube\.com\/watch\?v=([^&]+)/',
            '/youtu\.be\/([^?]+)/',
            '/youtube\.com\/embed\/([^?]+)/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Get video information using web scraping
     */
    private function getVideoInfo(string $videoId): array
    {
        $url = "https://www.youtube.com/watch?v=" . $videoId;

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]);

        $response = curl_exec($ch);

        if ($response === false) {
            throw new Exception("Error accessing YouTube: " . curl_error($ch));
        }

        curl_close($ch);

        // Extract title
        if (!preg_match('/<title>(.+?) - YouTube<\/title>/', $response, $titleMatches)) {
            throw new Exception("Could not find video title");
        }
        $title = html_entity_decode($titleMatches[1], ENT_QUOTES);

        // Extract views
        $views = 0;
        if (preg_match('/"viewCount":\s*"(\d+)"/', $response, $viewMatches)) {
            $views = (int)$viewMatches[1];
        } elseif (preg_match('/\"viewCount\"\s*:\s*{.*?\"simpleText\"\s*:\s*\"([\d,\.]+)\"/', $response, $viewMatches)) {
            $views = (int)str_replace(['.', ','], '', $viewMatches[1]);
        }

        if (empty($title)) {
            throw new Exception("Video not found or unavailable");
        }

        return [
            'title' => $title,
            'views' => $views,
            'youtube_id' => $videoId,
            'thumbnail' => "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg"
        ];
    }
}
