<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SongFactory extends Factory
{
    public function definition(): array
    {
        $youtubeId = $this->faker->regexify('[A-Za-z0-9_-]{11}');
        
        return [
            'title' => $this->faker->sentence(3),
            'artist' => 'Tião Carreiro & Pardinho',
            'youtube_id' => $youtubeId,
            'youtube_url' => 'https://www.youtube.com/watch?v=' . $youtubeId,
            'thumbnail' => 'https://img.youtube.com/vi/' . $youtubeId . '/hqdefault.jpg',
            'views' => $this->faker->numberBetween(10000, 10000000),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }
}
