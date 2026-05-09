'use client'

import { useState, useTransition, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, RefreshCw, Type, Palette, ArrowRight, ArrowLeft, Maximize2, Zap, LayoutGrid, Trash2 } from 'lucide-react'
import { Post } from '@/types'

export function DashboardUI({ 
  initialPending, 
  initialPublished,
  runPipelineAction,
  publishPostAction,
  rejectPostAction,
  deleteSlideAction,
  flushDatabaseAction
}: {
  initialPending: Post[]
  initialPublished: Post[]
  runPipelineAction: (template: string) => Promise<void>
  publishPostAction: (postId: string, formData: FormData) => Promise<void>
  rejectPostAction: (postId: string, formData: FormData) => Promise<void>
  deleteSlideAction: (postId: string, slideIndex: number) => Promise<{ error?: string, success?: boolean }>
  flushDatabaseAction: () => Promise<void>
}) {
  const [isPending, startTransition] = useTransition()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Pipeline template selection
  const [pipelineTemplate, setPipelineTemplate] = useState('fonts')

  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Preview Dialog State
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [previewData, setPreviewData] = useState<{ first: string, mid: string, last: string } | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  const handleShowPreview = async () => {
    if (pipelineTemplate === 'all') {
      // If 'all' is selected, skip preview and just run it or force user to select one.
      // Let's force them to select a specific one for preview.
      alert('Please select a specific template (FONTS, PALETTES, DUOTONE) to preview.')
      return
    }

    setShowPreviewDialog(true)
    setPreviewData(null)
    setIsLoadingPreview(true)

    try {
      const res = await fetch(`/api/preview?template=${pipelineTemplate}`)
      if (res.ok) {
        const data = await res.json()
        setPreviewData(data)
      } else {
        // We allow continuing even if preview fails
        console.warn('Failed to load preview images.')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleConfirmRun = () => {
    setShowPreviewDialog(false)
    // Use startTransition so isPending flag activates, giving visual feedback
    startTransition(async () => {
      try {
        await runPipelineAction(pipelineTemplate)
      } catch (err) {
        console.error('Pipeline failed:', err)
        alert('Pipeline failed. Check the console for details.')
      }
    })
  }

  const handlePublish = (postId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Optimistic UI update
    setLocalPending(prev => prev.filter(p => p.id !== postId))

    // Async background request
    publishPostAction(postId, formData).catch(console.error)
  }

  const handleReject = (postId: string) => {
    const formData = new FormData()

    // Optimistic UI update
    setLocalPending(prev => prev.filter(p => p.id !== postId))

    // Async background request
    rejectPostAction(postId, formData).catch(console.error)
  }

  const handleDeleteSlide = (postId: string, slideIndex: number) => {
    // Optimistic UI update
    setLocalPending(prev => prev.map(p => {
      if (p.id === postId) {
        const newUrls = [...p.slideUrls]
        newUrls.splice(slideIndex, 1)
        return { ...p, slideUrls: newUrls }
      }
      return p
    }))

    // Async background request
    deleteSlideAction(postId, slideIndex).then(res => {
      if (res && res.error) {
        alert(res.error)
        // Ideally revert local state here, but simple reload or resync works too
      }
    }).catch(console.error)
  }

  const [localPending, setLocalPending] = useState<Post[]>(initialPending)

  // Make sure to sync if initialPending changes from server (though optimistic should handle it)
  useMemo(() => {
    setLocalPending(initialPending)
  }, [initialPending])

  const filteredPosts = localPending

  // Compute a safe index that is always in-bounds — never mutate state during render
  const safeIndex = filteredPosts.length === 0
    ? 0
    : Math.min(currentIndex, filteredPosts.length - 1)

  // Sync currentIndex to safeIndex in an effect (not during render)
  useEffect(() => {
    if (currentIndex !== safeIndex) {
      setCurrentIndex(safeIndex)
    }
  }, [currentIndex, safeIndex])

  // Horizontal Drag to Scroll State
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setStartX(e.pageX - e.currentTarget.offsetLeft)
    setScrollLeft(e.currentTarget.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - e.currentTarget.offsetLeft
    const walk = (x - startX) * 2
    e.currentTarget.scrollLeft = scrollLeft - walk
  }

  const currentPost = filteredPosts[currentIndex]

  const nextPost = () => {
    if (currentIndex < filteredPosts.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevPost = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <div style={{ 
      height: '100vh', width: '100vw', 
      backgroundColor: '#000', color: '#fff', 
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @font-face {
          font-family: 'Tech';
          src: url('https://fonts.cdnfonts.com/s/16061/TerminusTTF-4.40.1.woff');
        }

        .tech-text {
          font-family: 'Terminus', 'Tech', 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .industrial-text {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .brutalist-button {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: 2px solid #fff;
          box-shadow: 4px 4px 0px rgba(255, 255, 255, 0.1);
        }
        .brutalist-button:hover:not(:disabled) {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px rgba(255, 214, 10, 0.4);
        }
        .brutalist-button:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px rgba(255, 214, 10, 0.4);
        }
        .brutalist-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .image-hover-zoom {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .image-hover-zoom:hover {
          transform: scale(1.03);
          z-index: 10;
        }
      `}} />

      {/* Generation Preview Dialog */}
      <AnimatePresence>
        {showPreviewDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '24px'
            }}
          >
            <div style={{
              backgroundColor: '#111',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }}>
              <h2 className="industrial-text" style={{ margin: 0, fontSize: '32px', color: '#FFD60A' }}>PREVIEW: {pipelineTemplate.toUpperCase()}</h2>

              <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px', minWidth: '600px', justifyContent: 'center' }}>
                {isLoadingPreview ? (
                  <div className="tech-text" style={{ color: '#888', padding: '100px', textAlign: 'center', width: '100%' }}>
                    GENERATING REALTIME SATORI PREVIEW...
                  </div>
                ) : previewData ? (
                  <>
                    {previewData.first && <img src={previewData.first} alt="First Slide" style={{ height: '400px', objectFit: 'contain', border: '1px solid #333' }} />}
                    <img src={previewData.mid} alt="Content Slide" style={{ height: '400px', objectFit: 'contain', border: '1px solid #333' }} />
                    {previewData.last && <img src={previewData.last} alt="Last Slide" style={{ height: '400px', objectFit: 'contain', border: '1px solid #333' }} />}
                  </>
                ) : (
                   <div className="tech-text" style={{ color: '#888', padding: '100px', textAlign: 'center', width: '100%' }}>
                    PREVIEW UNAVAILABLE. YOU CAN STILL RUN THE PIPELINE.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowPreviewDialog(false)}
                  className="brutalist-button tech-text"
                  style={{
                    padding: '12px 24px', backgroundColor: '#333', color: '#fff',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmRun}
                  className="brutalist-button tech-text"
                  style={{
                    padding: '12px 24px', backgroundColor: '#FFD60A', color: '#000',
                    border: 'none', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  CONFIRM & GENERATE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'zoom-out'
            }}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={previewImage}
              style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain', boxShadow: '0 0 100px rgba(0,0,0,0.8)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main UI */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="industrial-text" style={{ fontSize: '48px', margin: 0, color: '#FFD60A', lineHeight: 0.9 }}>
              FONTS<br/>.PACE
            </h1>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              <div className="tech-text" style={{ fontSize: '12px', color: '#666', borderLeft: '2px solid #FFD60A', paddingLeft: '8px' }}>
                PENDING_QUEUE: {localPending.length}<br/>
                STATUS: {isPending ? 'BUSY_PIPELINE' : 'READY_IDLE'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                value={pipelineTemplate}
                onChange={e => setPipelineTemplate(e.target.value)}
                className="tech-text"
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #333',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  outline: 'none',
                  textTransform: 'uppercase'
                }}
              >
                <option value="fonts">FONTS</option>
                <option value="palettes">PALETTES</option>
                <option value="duotone">DUOTONE</option>
              </select>
              
              <button
                onClick={handleShowPreview}
                disabled={isPending}
                className="tech-text"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 24px', backgroundColor: '#fff', color: '#000',
                  border: 'none', borderRadius: '4px', cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                <motion.div animate={{ rotate: isPending ? 360 : 0 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Zap size={16} fill={isPending ? "#FFD60A" : "none"} />
                </motion.div>
                {isPending ? 'EXEC...' : 'RUN'}
              </button>

              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to flush the KV database? This action cannot be undone.')) {
                    await flushDatabaseAction()
                    alert('Database flushed.')
                  }
                }}
                className="tech-text"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 24px', backgroundColor: '#ff0055', color: '#fff',
                  border: 'none', borderRadius: '4px', cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                <Trash2 size={16} />
                FLUSH KV
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0, gap: '24px' }}>
          
          {filteredPosts.length === 0 ? (
            <div style={{ 
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px dashed #333', borderRadius: '8px'
            }}>
              <div className="tech-text" style={{ textAlign: 'center', color: '#666' }}>
                <LayoutGrid size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p>NO POSTS MATCHING CRITERIA.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Left Column: Post Details & Controls */}
              <div style={{ 
                width: '350px', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', backgroundColor: '#111',
                padding: '24px', borderRadius: '8px', border: '1px solid #222'
              }}>
                <AnimatePresence mode="wait">
                  {currentPost ? (
                    <motion.div 
                      key={currentPost.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <span className="tech-text" style={{ 
                          padding: '4px 8px', backgroundColor: currentPost.type === 'fonts' ? '#0033ff' : currentPost.type === 'palettes' ? '#ff0055' : '#ffaa00',
                          color: '#fff', fontSize: '11px', letterSpacing: '0.1em'
                        }}>
                          [{currentPost.type.toUpperCase()}]
                        </span>
                      </div>

                      <h2 className="industrial-text" style={{ fontSize: '32px', marginBottom: '8px', lineHeight: 1 }}>{currentPost.title}</h2>
                      <div className="tech-text" style={{ color: '#666', fontSize: '12px', marginBottom: '24px' }}>
                        ID: {currentPost.id.slice(0, 8)}...<br/>
                        CREATED: {new Date(currentPost.createdAt).toLocaleDateString()}
                      </div>

                      <form onSubmit={(e) => handlePublish(currentPost.id, e)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="tech-text" style={{ fontSize: '11px', color: '#888' }}>CAPTION</label>
                          <textarea 
                            name="caption"
                            defaultValue={currentPost.caption}
                            className="hide-scrollbar"
                            style={{ 
                              width: '100%', height: '150px', backgroundColor: '#000', color: '#fff',
                              border: '1px solid #333', padding: '12px', borderRadius: '4px',
                              fontFamily: 'monospace', fontSize: '13px', resize: 'none'
                            }}
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={isPending}
                          className="brutalist-button tech-text"
                          style={{
                            padding: '16px', backgroundColor: '#00cc66', color: '#000',
                            fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                          }}
                        >
                          <Check size={24} strokeWidth={3} />
                          APPROVE
                        </button>
                      </form>

                      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px' }}>
                        <button
                          onClick={() => handleReject(currentPost.id)}
                          disabled={isPending}
                          className="brutalist-button tech-text"
                          style={{
                            padding: '16px 24px', backgroundColor: '#1a1a1a',
                            color: '#ff4444', border: '1px solid #ff4444', cursor: 'pointer',
                            fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <X size={20} strokeWidth={3} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p className="tech-text" style={{ color: '#666' }}>NO POST DATA AVAILABLE.</p>
                    </div>
                  )}
                </AnimatePresence>

                {/* Pagination Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #333', margin: '24px -24px -24px', padding: '24px' }}>
                  <button 
                    onClick={prevPost}
                    disabled={currentIndex === 0}
                    style={{ 
                      background: 'none', border: 'none', color: currentIndex === 0 ? '#333' : '#fff', cursor: currentIndex === 0 ? 'default' : 'pointer' 
                    }}
                  >
                    <ArrowLeft size={24} />
                  </button>

                  <div className="tech-text" style={{ color: '#888', fontSize: '14px', letterSpacing: '0.2em' }}>
                    {String(currentIndex + 1).padStart(2, '0')} / {String(filteredPosts.length).padStart(2, '0')}
                  </div>

                  <button 
                    onClick={nextPost}
                    disabled={currentIndex === filteredPosts.length - 1}
                    style={{ 
                      background: 'none', border: 'none', color: currentIndex === filteredPosts.length - 1 ? '#333' : '#fff', cursor: currentIndex === filteredPosts.length - 1 ? 'default' : 'pointer' 
                    }}
                  >
                    <ArrowRight size={24} />
                  </button>
                </div>
              </div>

              {/* Right Column: Imagery Gallery */}
              <div
                className="hide-scrollbar"
                style={{
                  flex: 1, backgroundColor: '#050505', borderRadius: '8px', border: '1px solid #222',
                  overflowX: 'auto', display: 'flex', alignItems: 'center', padding: '40px', gap: '40px',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                <AnimatePresence mode="wait">
                  {currentPost && currentPost.slideUrls && (
                    <motion.div
                      key={currentPost.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'flex', gap: '40px', minWidth: 'min-content', margin: 'auto' }}
                    >
                      {currentPost.slideUrls.map((url, idx) => {
                      const imgUrl = url;
                      return (
                        <div key={`${currentPost.id}-${idx}`} style={{ position: 'relative' }}>
                          <img
                            src={imgUrl}
                            onClick={() => setPreviewImage(imgUrl)}
                            className="image-hover-zoom"
                            alt={`Slide ${idx + 1}`}
                            style={{
                              height: 'calc(100vh - 220px)',
                              maxHeight: '1200px',
                              minHeight: '400px',
                              width: 'auto',
                              aspectRatio: '1080/1350',
                              objectFit: 'cover',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                              cursor: 'zoom-in',
                              border: '1px solid #333'
                            }}
                          />
                          <div className="tech-text" style={{ 
                            position: 'absolute', top: '-16px', left: '-16px', 
                            fontSize: '100px', fontWeight: 'bold', color: 'rgba(255,255,255,0.05)',
                            pointerEvents: 'none', lineHeight: 1
                          }}>
                            {String(idx + 1).padStart(2, '0')}
                          </div>

                          {currentPost.slideUrls.length > 4 && (
                            <button
                              onClick={() => handleDeleteSlide(currentPost.id, idx)}
                              disabled={isPending}
                              title="Delete Slide"
                              style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: '#ff4444',
                                border: '1px solid rgba(255,68,68,0.5)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 20,
                                transition: 'all 0.2s',
                              }}
                              className="image-hover-zoom"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  )
}
