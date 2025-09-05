<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Song extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'artist',
        'views',
        'youtube_id',
        'youtube_url',
        'thumbnail',
        'status'
    ];

    protected $casts = [
        'views' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get formatted view count
     */
    public function getFormattedViewsAttribute(): string
    {
        if ($this->views >= 1000000000) {
            return number_format($this->views / 1000000000, 2) . 'B';
        }
        if ($this->views >= 1000000) {
            return number_format($this->views / 1000000, 2) . 'M';
        }
        if ($this->views >= 1000) {
            return number_format($this->views / 1000, 1) . 'K';
        }
        return (string) $this->views;
    }

    /**
     * Get YouTube URL
     */
    public function getYoutubeUrlAttribute(): string
    {
        return "https://www.youtube.com/watch?v={$this->youtube_id}";
    }

    /**
     * Scope for approved songs
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for pending songs
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for top 5 songs by views
     */
    public function scopeTop5($query)
    {
        return $query->approved()
            ->orderBy('views', 'desc')
            ->limit(5);
    }
}
