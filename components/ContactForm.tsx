'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
// useForm = hook หลักของ React Hook Form
// ให้เราจัดการ form ทั้งหมด: register, validate, submit, errors

interface ContactFormData {
  name: string;       // ชื่อผู้ติดต่อ
  email: string;      // อีเมล (required)
  phone: string;      // เบอร์โทร (optional)
  subject: string;    // หัวข้อ (required)
  message: string;    // ข้อความ (required)
}

const SUBJECTS = [
  { value: '', label: 'Select a subject...' },
  { value: 'buy', label: "I want to buy a property" },
  { value: 'rent', label: "I want to rent a property" },
  { value: 'sell', label: "I want to sell my property" },
  { value: 'schedule', label: "Schedule a viewing" },
  { value: 'other', label: "Other inquiry" },
];

const inputClass =
  'w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
const errorInputClass =
  'w-full px-4 py-2.5 text-sm bg-red-50 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition';

export default function ContactForm() {
  // register   = ผูก input กับ form (แทน value + onChange)
  // handleSubmit = wrap function submit พร้อม validate อัตโนมัติ
  // formState  = { errors, isSubmitting } สถานะของ form
  // reset      = ล้าง form กลับค่าเริ่มต้น
  //
  //   แบบเดิม: const [formData, setFormData] = useState({...})
  //            const [loading, setLoading] = useState(false)
  //   RHF:     const { register, handleSubmit, ... } = useForm()
  //            → ไม่ต้องสร้าง state เอง, ไม่ต้อง handleChange
  const {
    register,        // ฟังก์ชันผูก input: {...register('fieldName', { rules })}
    handleSubmit,    // ฟังก์ชัน wrap onSubmit: handleSubmit(mySubmitFn)
    formState: {
      errors,        // object เก็บ error ของแต่ละ field: errors.email?.message
      isSubmitting,  // true ขณะ submit อยู่ (แทน loading state)
    },
    reset,           // ฟังก์ชันล้าง form ทั้งหมด
  } = useForm<ContactFormData>({
    // defaultValues = ค่าเริ่มต้นของทุก field
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  // 📬 State สำหรับแสดงหน้า "ส่งสำเร็จ"
  // (ยังใช้ useState ปกติ เพราะไม่ใช่ form field)
  const [submitted, setSubmitted] = useState(false);

  //   แบบเดิม: const handleSubmit = (e) => { e.preventDefault(); validate(); ... }
  //   RHF:     const onSubmit = (data) => { /* data ถูก validate แล้ว */ }
  //            → ไม่ต้อง e.preventDefault() เอง, ไม่ต้อง validate เอง
  const onSubmit = async (data: ContactFormData) => {
    // data = ข้อมูล form ที่ผ่าน validation แล้ว (type-safe)
    console.log('Form submitted:', data);

    // จำลอง API call (ในโปรเจกต์จริงจะ fetch ไปยัง backend)
    await new Promise((r) => setTimeout(r, 1200));

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
        <p className="text-gray-500 mb-6">
          Thank you for reaching out. One of our agents will get back to you within 24 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            reset(); // 🔑 RHF: reset() ล้าง form กลับ defaultValues อัตโนมัติ
            // แบบเดิม: setFormData({ name: '', email: '', ... }) ← ต้องเขียนเอง
          }}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form
      //   แบบเดิม: onSubmit={handleSubmit} ← ต้อง e.preventDefault() + validate เอง
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-5"
      noValidate // ปิด browser validation เพราะใช้ RHF validate แทน
    >
      <div className="grid sm:grid-cols-2 gap-5">
        {/* ================================================================= */}
        {/* 👤 Name Field                                                     */}
        {/* ================================================================= */}
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            placeholder="John Smith"
            autoComplete="name"
            className={errors.name ? errorInputClass : inputClass}
            // ...register() จะ spread props เหล่านี้ให้อัตโนมัติ:
            //   - name="name"
            //   - ref={...}      ← RHF ใช้ ref แทน state (ไม่ re-render ทุกตัวอักษร)
            //   - onChange={...} ← จัดการให้อัตโนมัติ
            //   - onBlur={...}   ← validate ตอน blur (ถ้าตั้ง mode)
            //
            //   แบบเดิม: name="name" value={formData.name} onChange={handleChange}
            //   RHF:     {...register('name', { required: '...' })}
            //            → สั้นกว่า, validate ในตัว, ไม่ re-render ทั้ง form
            {...register('name', {
              required: 'Please enter your name',  // ข้อความ error ถ้าว่าง
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',  // ข้อความ error ถ้าสั้นเกิน
              },
            })}
          />
          {/* แสดง error message ถ้ามี — errors.name จะมีค่าเมื่อ validate ไม่ผ่าน */}
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* ================================================================= */}
        {/* 📧 Email Field                                                    */}
        {/* ================================================================= */}
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            placeholder="john@example.com"
            autoComplete="email"
            className={errors.email ? errorInputClass : inputClass}
            {...register('email', {
              required: 'Please enter your email',
              // pattern = regex validation — ตรวจรูปแบบ email
              // RHF: ใส่ pattern ใน register ได้เลย
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* ================================================================= */}
        {/* 📞 Phone Field (Optional — ไม่มี required)                        */}
        {/* ================================================================= */}
        <div>
          <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number
          </label>
          <input
            id="contact-phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            autoComplete="tel"
            className={errors.phone ? errorInputClass : inputClass}
            // ไม่มี required — field นี้เป็น optional
            // แต่ถ้ากรอกมา ต้องเป็นรูปแบบเบอร์โทรที่ถูกต้อง
            {...register('phone', {
              pattern: {
                value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
                message: 'Please enter a valid phone number',
              },
            })}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* ================================================================= */}
        {/* 📋 Subject Dropdown                                               */}
        {/* ================================================================= */}
        <div>
          <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1.5">
            Subject <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="contact-subject"
            className={errors.subject ? errorInputClass : inputClass}
            {...register('subject', {
              required: 'Please select a subject',
            })}
          >
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value} disabled={s.value === ''}>
                {s.label}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 💬 Message Textarea                                                 */}
      {/* =================================================================== */}
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">
          Message <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder="Tell us about your property needs, preferred locations, budget, timeline..."
          className={`${errors.message ? errorInputClass : inputClass} resize-none`}
          {...register('message', {
            required: 'Please enter your message',
            minLength: {
              value: 10,
              message: 'Message must be at least 10 characters',
            },
          })}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      {/* Privacy note */}
      <p className="text-xs text-gray-400">
        By submitting this form you agree to our{' '}
        <a href="#" className="underline hover:text-gray-600">
          Privacy Policy
        </a>
        . We&apos;ll never share your information with third parties.
      </p>

      {/* =================================================================== */}
      {/* 🚀 Submit Button                                                    */}
      {/* =================================================================== */}
      <button
        type="submit"
        //   แบบเดิม: disabled={loading} ← ต้อง setLoading(true/false) เอง
        //   RHF:     disabled={isSubmitting} ← อัตโนมัติ
        disabled={isSubmitting}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
}
