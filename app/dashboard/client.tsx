'use client'

import { useState, useTransition, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, RefreshCw, Type, Palette, ArrowRight, ArrowLeft, Maximize2, Zap, LayoutGrid, Trash2 } from 'lucide-react'
import { Post } from '@/types'

export function DashboardUI({ 
  initialPending, 
  initialPublished,
  runPipelineAction,
  publishPostAction,
  rejectPostAction,
  deleteSlideAction
}: {
  initialPending: Post[]
  initialPublished: Post[]
  runPipelineAction: (template: string) => Promise<void>
  publishPostAction: (postId: string, formData: FormData) => Promise<void>
  rejectPostAction: (postId: string, formData: FormData) => Promise<void>
  deleteSlideAction: (postId: string, slideIndex: number) => Promise<{ error?: string, success?: boolean }>
}) {
  const [isPending, startTransition] = useTransition()
  
  // Filtering
  const [filter, setFilter] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Pipeline template selection
  const [pipelineTemplate, setPipelineTemplate] = useState('all')

  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleRunPipeline = () => {
    startTransition(async () => {
      await runPipelineAction(pipelineTemplate)
    })
  }

  const handlePublish = (postId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await publishPostAction(postId, formData)
    })
  }

  const handleReject = (postId: string) => {
    const formData = new FormData()
    startTransition(async () => {
      await rejectPostAction(postId, formData)
    })
  }

  const handleDeleteSlide = (postId: string, slideIndex: number) => {
    startTransition(async () => {
      const res = await deleteSlideAction(postId, slideIndex)
      if (res.error) {
        alert(res.error)
      }
    })
  }

  const filteredPosts = useMemo(() => {
    return initialPending.filter(post => filter === 'all' || post.type === filter)
  }, [initialPending, filter])

  // Ensure currentIndex stays valid when filter changes
  if (currentIndex >= filteredPosts.length && filteredPosts.length > 0) {
    setCurrentIndex(0)
  }

  const currentPost = filteredPosts[currentIndex]

  const nextPost = () => setCurrentIndex(prev => Math.min(prev + 1, filteredPosts.length - 1))
  const prevPost = () => setCurrentIndex(prev => Math.max(prev - 1, 0))

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#f3f4f6', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        
        .industrial-text {
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
        }
        
        .tech-text {
          font-family: 'JetBrains Mono', monospace;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .brutalist-button {
          transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
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

      {/* Lightbox */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              cursor: 'zoom-out',
              padding: '24px'
            }}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={previewImage}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid #333'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '24px', gap: '24px' }}>
        
        {/* Header / Top Bar */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          borderBottom: '2px solid #333', paddingBottom: '20px' 
        }}>
          <div>
            <h1 className="industrial-text" style={{ margin: 0, fontSize: '48px', lineHeight: 1, letterSpacing: '0.02em', color: '#fffc' }}>
              P<span style={{ color: '#FFD60A' }}>/</span>CE CORE
            </h1>
            <div className="tech-text" style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '13px', color: '#888' }}>
              <span>[ PENDING: {initialPending.length} ]</span>
              <span>[ PUBLISHED: {initialPublished.length} ]</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
              {(['all', 'fonts', 'palettes', 'duotone'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setCurrentIndex(0); }}
                  className="tech-text"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: filter === f ? '#FFD60A' : 'transparent',
                    color: filter === f ? '#000' : '#888',
                    border: 'none',
                    borderRight: f !== 'duotone' ? '1px solid #333' : 'none',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div style={{ width: '1px', height: '32px', backgroundColor: '#333' }} />

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
                <option value="all">ALL TMPL</option>
                <option value="fonts">FONTS</option>
                <option value="palettes">PALETTES</option>
                <option value="duotone">DUOTONE</option>
              </select>
              
              <button
                onClick={handleRunPipeline}
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

                    <h2 className="industrial-text" style={{ 
                      fontSize: '32px', margin: '0 0 24px', lineHeight: 1.1, color: '#e5e5e5' 
                    }}>
                      {currentPost.title}
                    </h2>

                    <form id={`publish-form-${currentPost.id}`} onSubmit={(e) => handlePublish(currentPost.id, e)} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <label className="tech-text" style={{ fontSize: '12px', color: '#888', marginBottom: '8px', display: 'block' }}>CAPTION DATA</label>
                      <textarea
                        name="caption"
                        defaultValue={currentPost.caption}
                        className="tech-text hide-scrollbar"
                        style={{
                          flex: 1,
                          width: '100%',
                          padding: '16px',
                          backgroundColor: '#0a0a0a',
                          border: '1px solid #333',
                          color: '#ccc',
                          fontSize: '13px',
                          lineHeight: 1.5,
                          resize: 'none',
                          outline: 'none',
                          borderRadius: '4px'
                        }}
                      />
                    </form>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button
                        type="submit"
                        form={`publish-form-${currentPost.id}`}
                        disabled={isPending}
                        className="brutalist-button industrial-text"
                        style={{
                          flex: 1, padding: '16px 0', backgroundColor: '#FFD60A',
                          color: '#000', border: '1px solid #000', cursor: 'pointer',
                          fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        <Check size={20} strokeWidth={3} /> APPROVE
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(currentPost.id)}
                        disabled={isPending}
                        className="brutalist-button industrial-text"
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
              <div className="hide-scrollbar" style={{ 
                flex: 1, backgroundColor: '#050505', borderRadius: '8px', border: '1px solid #222',
                overflowX: 'auto', display: 'flex', alignItems: 'center', padding: '40px', gap: '40px'
              }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPost.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', gap: '40px', minWidth: 'min-content', margin: 'auto' }}
                  >
                    {currentPost.slideUrls.map((url, idx) => {
                      const imgUrl = `/api/blob?url=${encodeURIComponent(url)}`;
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
                </AnimatePresence>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  )
}
