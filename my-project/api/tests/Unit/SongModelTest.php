<?php

namespace Tests\Unit;

use App\Models\Song;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SongModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_song_has_correct_fillable_attributes(): void
    {
        $song = new Song();
        
        $expected = [
            'title', 'artist', 'views', 'youtube_id', 
            'youtube_url', 'thumbnail', 'status'
        ];
        
        $this->assertEquals($expected, $song->getFillable());
    }

    public function test_song_scope_approved(): void
    {
        Song::factory()->create(['status' => 'approved']);
        Song::factory()->create(['status' => 'pending']);
        Song::factory()->create(['status' => 'rejected']);

        $approvedSongs = Song::approved()->get();

        $this->assertCount(1, $approvedSongs);
        $this->assertEquals('approved', $approvedSongs->first()->status);
    }

    public function test_song_scope_top5(): void
    {
        Song::factory()->create(['views' => 1000, 'status' => 'approved']);
        Song::factory()->create(['views' => 2000, 'status' => 'approved']);
        Song::factory()->create(['views' => 3000, 'status' => 'approved']);
        Song::factory()->create(['views' => 4000, 'status' => 'approved']);
        Song::factory()->create(['views' => 5000, 'status' => 'approved']);
        Song::factory()->create(['views' => 6000, 'status' => 'approved']);

        $top5Songs = Song::top5()->get();

        $this->assertCount(5, $top5Songs);
        $this->assertEquals(6000, $top5Songs->first()->views);
    }

    public function test_formatted_views_accessor(): void
    {
        $song = Song::factory()->make(['views' => 1234567]);

        $this->assertEquals('1.23M', $song->formatted_views);
    }
}
