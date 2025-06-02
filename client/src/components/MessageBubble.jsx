import React from 'react'

export default function MessageBubble() {
  return (
    <>
      <div className="flex items-start gap-2.5 mb-4">
        <img className="w-8 h-8 rounded-full" src="https://api.dicebear.com/7.x/bottts/svg?seed=bot" alt="AI Avatar" />
        <div className="flex flex-col gap-1 w-full max-w-[320px]">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Bot</span>
            </div>
            <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
              <p className="text-sm font-normal text-gray-900 dark:text-white">This is a left side message</p>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">11:46</span>
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span>
            </div>
        </div>
      </div>

      <div className="flex items-start justify-end gap-2.5 mb-4">
        <div className="flex flex-col gap-1 w-full max-w-[320px]">
            <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">You</span>
            </div>
            <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-blue-600 rounded-s-xl rounded-ee-xl dark:bg-blue-700">
              <p className="text-sm font-normal text-white">This is a right side message</p>
            </div>
            <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">11:47</span>
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 text-right">Delivered</span>
            </div>
        </div>
        <img className="w-8 h-8 rounded-full" src="https://api.dicebear.com/7.x/avataaars/svg?seed=male" alt="User Avatar" />
      </div>
    </>
  )
}
