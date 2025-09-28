'use client'

import { VideoPlayer, EnhancedVideoPlayer } from '@/components/media/video-player'
import { SimpleVideoTest } from '@/components/media/simple-video-test'
import { WorkingVideoPlayer } from '@/components/media/working-video-player'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VideoPlayerDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Video.js Player Demo</h1>
          <p className="text-muted-foreground">
            Testing Video.js integration across the Flavours platform
          </p>
        </div>

        {/* Simple HTML5 Video Test */}
        <Card>
          <CardHeader>
            <CardTitle>Simple HTML5 Video Test</CardTitle>
            <CardDescription>
              Basic HTML5 video element to test if videos work at all
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleVideoTest />
          </CardContent>
        </Card>

        {/* Working Video Player */}
        <Card>
          <CardHeader>
            <CardTitle>Working Video Player</CardTitle>
            <CardDescription>
              Reliable video player with multiple fallback sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkingVideoPlayer />
          </CardContent>
        </Card>

        {/* Basic Video Player */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Video Player</CardTitle>
            <CardDescription>
              Standard Video.js player with controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoPlayer
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
              controls={true}
              autoplay={false}
              muted={false}
              width="100%"
              height="450px"
              className="rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Enhanced Video Player */}
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Video Player</CardTitle>
            <CardDescription>
              Video player with title and progress display
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedVideoPlayer
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
              poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg"
              controls={true}
              autoplay={false}
              muted={false}
              width="100%"
              height="450px"
              className="rounded-lg"
              showTitle={true}
              title="Sample Video Content"
              showProgress={true}
            />
          </CardContent>
        </Card>

        {/* Autoplay Video */}
        <Card>
          <CardHeader>
            <CardTitle>Autoplay Video (Muted)</CardTitle>
            <CardDescription>
              Video that starts playing automatically when loaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoPlayer
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg"
              controls={true}
              autoplay={true}
              muted={true}
              width="100%"
              height="450px"
              className="rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Multiple Video Players */}
        <Card>
          <CardHeader>
            <CardTitle>Multiple Video Players</CardTitle>
            <CardDescription>
              Grid of video players for testing multiple instances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VideoPlayer
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
                poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg"
                controls={true}
                autoplay={false}
                muted={true}
                width="100%"
                height="225px"
                className="rounded-lg"
              />
              <VideoPlayer
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
                poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg"
                controls={true}
                autoplay={false}
                muted={true}
                width="100%"
                height="225px"
                className="rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
