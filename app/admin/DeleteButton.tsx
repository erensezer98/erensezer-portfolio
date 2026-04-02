'use client'

export default function DeleteButton({ id, action }: { id: string; action: (fd: FormData) => Promise<void> }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-[10px] tracking-widest uppercase text-muted hover:text-red-500 transition-colors"
        onClick={(e) => {
          if (!confirm('Are you sure you want to delete this project?')) {
            e.preventDefault()
          }
        }}
      >
        Delete
      </button>
    </form>
  )
}
