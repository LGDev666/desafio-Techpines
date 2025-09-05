<?php

namespace Database\Seeders;

use App\Models\Song;
use Illuminate\Database\Seeder;

class SongSeeder extends Seeder
{
    public function run(): void
    {
        $songs = [
            [
                'title' => 'O Mineiro e o Italiano',
                'artist' => 'Tião Carreiro & Pardinho',
                'views' => 5200000,
                'youtube_id' => 's9kVG2ZaTS4',
                'youtube_url' => 'https://www.youtube.com/watch?v=s9kVG2ZaTS4',
                'thumbnail' => 'https://img.youtube.com/vi/s9kVG2ZaTS4/hqdefault.jpg',
                'status' => 'approved'
            ],
            [
                'title' => 'Pagode em Brasília',
                'artist' => 'Tião Carreiro & Pardinho',
                'views' => 5000000,
                'youtube_id' => 'lpGGNA6_920',
                'youtube_url' => 'https://www.youtube.com/watch?v=lpGGNA6_920',
                'thumbnail' => 'https://img.youtube.com/vi/lpGGNA6_920/hqdefault.jpg',
                'status' => 'approved'
            ],
            [
                'title' => 'Terra Roxa',
                'artist' => 'Tião Carreiro & Pardinho',
                'views' => 3300000,
                'youtube_id' => '4Nb89GFu2g4',
                'youtube_url' => 'https://www.youtube.com/watch?v=4Nb89GFu2g4',
                'thumbnail' => 'https://img.youtube.com/vi/4Nb89GFu2g4/hqdefault.jpg',
                'status' => 'approved'
            ],
            [
                'title' => 'Tristeza do Jeca',
                'artist' => 'Tião Carreiro & Pardinho',
                'views' => 154000,
                'youtube_id' => 'tRQ2PWlCcZk',
                'youtube_url' => 'https://www.youtube.com/watch?v=tRQ2PWlCcZk',
                'thumbnail' => 'https://img.youtube.com/vi/tRQ2PWlCcZk/hqdefault.jpg',
                'status' => 'approved'
            ],
            [
                'title' => 'Rio de Lágrimas',
                'artist' => 'Tião Carreiro & Pardinho',
                'views' => 153000,
                'youtube_id' => 'FxXXvPL3JIg',
                'youtube_url' => 'https://www.youtube.com/watch?v=FxXXvPL3JIg',
                'thumbnail' => 'https://img.youtube.com/vi/FxXXvPL3JIg/hqdefault.jpg',
                'status' => 'approved'
            ],
            [
                'title' => 'Rei do Gado',
                'artist' => 'Tião Carreiro & Pardinho',
                'views' => 1250000,
                'youtube_id' => '8cqJ8XMqGQs',
                'youtube_url' => 'https://www.youtube.com/watch?v=8cqJ8XMqGQs',
                'thumbnail' => 'https://img.youtube.com/vi/8cqJ8XMqGQs/hqdefault.jpg',
                'status' => 'approved'
            ],
            [
                'title' => 'Chico Mineiro',
                'artist' => 'Tião Carreiro & Pardinho',
                'views' => 980000,
                'youtube_id' => 'YQHsXMglC9A',
                'youtube_url' => 'https://www.youtube.com/watch?v=YQHsXMglC9A',
                'thumbnail' => 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg',
                'status' => 'approved'
            ],
            [
                'title' => 'Carro de Boi',
                'artist' => 'Tião Carreiro & Pardinho',
                'views' => 875000,
                'youtube_id' => 'a1B2c3D4E5F', // novo ID único
                'youtube_url' => 'https://www.youtube.com/watch?v=a1B2c3D4E5F',
                'thumbnail' => 'https://img.youtube.com/vi/a1B2c3D4E5F/hqdefault.jpg',
                'status' => 'approved'
            ],
            [
                'title' => 'Tropeiro Velho',
                'artist' => 'Tião Carreiro & Pardinho',
                'views' => 720000,
                'youtube_id' => 'f6G7h8I9J0K', // novo ID único
                'youtube_url' => 'https://www.youtube.com/watch?v=f6G7h8I9J0K',
                'thumbnail' => 'https://img.youtube.com/vi/f6G7h8I9J0K/hqdefault.jpg',
                'status' => 'approved'
            ],
            [
                'title' => 'Cabocla Teresa',
                'artist' => 'Tião Carreiro & Pardinho',
                'views' => 650000,
                'youtube_id' => 'L1M2N3O4P5Q', // novo ID único
                'youtube_url' => 'https://www.youtube.com/watch?v=L1M2N3O4P5Q',
                'thumbnail' => 'https://img.youtube.com/vi/L1M2N3O4P5Q/hqdefault.jpg',
                'status' => 'approved'
            ]
        ];

        foreach ($songs as $song) {
            Song::create($song);
        }
    }
}
