import Image from 'next/image'

export default function PlantDecoration() {
  return (
    <>
      {/* アイビー（右上・吊るすイメージ） */}
      <div className="fixed top-0 right-6 pointer-events-none z-10 select-none">
        <Image
          src="/green-leaf.png"
          alt=""
          width={160}
          height={230}
          className="object-contain"
          style={{ objectPosition: 'top right' }}
        />
      </div>

      {/* 鉢植え群（画面下部・右側） */}
      <div className="fixed bottom-4 right-4 pointer-events-none z-10 select-none">
        <Image src="/leaf-tall.png" alt="" width={90} height={130} className="object-contain object-bottom" />
      </div>
      <div className="fixed bottom-4 right-28 pointer-events-none z-10 select-none">
        <Image src="/leaf-midium.png" alt="" width={80} height={110} className="object-contain object-bottom" />
      </div>

      {/* 鉢植え群（画面下部・左側） */}
      <div className="fixed bottom-4 left-60 pointer-events-none z-10 select-none">
        <Image src="/leaf-small.png" alt="" width={70} height={100} className="object-contain object-bottom" />
      </div>
      <div className="fixed bottom-4 left-[19rem] pointer-events-none z-10 select-none">
        <Image src="/leaf-mini.png" alt="" width={60} height={85} className="object-contain object-bottom" />
      </div>
    </>
  )
}
