import React, { useState } from 'react';
import { CreditCard, UploadCloud, FileText, Check, ChevronRight, ChevronLeft } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axiosConfig';

export default function LoanApplicationForm({onSuccess}) {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    amount: "",
    term: "",
    purpose: "",
    employmentStatus: "",
    employmentAddress: "",
    monthlyIncome: "",
    documents: [],
    termsAgreed: true,
    creditCheck: true
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    // Basic validation
    if (step === 1) {
      if (!formData.fullName || !formData.amount || !formData.term || !formData.purpose || 
          !formData.employmentStatus || !formData.employmentAddress || !formData.monthlyIncome) {
        toast.error("Please fill all required fields");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.termsAgreed || !formData.creditCheck) {
      toast.error("Please agree to all terms and conditions");
      return;
    }
    
    // Validate documents
    if(!formData.amount || !formData.purpose || !formData.term){
        toast.error("Some fields are empty")
        return;
    }
    await axiosInstance.post('loan/applications/create',formData).then((res)=>{
      if(res.data.statusCode<400){
        // Simulating form submission
        toast.success("Loan application submitted successfully!");
        console.log("Form data submitted:", formData);
        setOpen(false);
        setStep(1);
        setFormData({
          fullName: "",
          amount: "",
          term: "",
          purpose: "",
          employmentStatus: "",
          employmentAddress: "",
          monthlyIncome: "",
          documents: [],
          termsAgreed: false,
          creditCheck: false
        });
        onSuccess()
      }
      else{
        toast.error(res.data.message || "Error creating loan application")
        console.log(res)
      }
    }).catch((err)=>{
      console.log(err);
      toast.error(err.message || "Error creating loan application")
    });
  };

  return (
    <div>
        <div className="relative mt-2 mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex-1 flex flex-col items-center ${step >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300'}`}>
                {step > 1 ? <Check className="h-5 w-5" /> : "1"}
              </div>
              <span className="text-xs mt-2 font-medium">Personal Info</span>
            </div>
            <div className={`w-full h-1 mx-2 ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 flex flex-col items-center ${step >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300'}`}>
                {step > 2 ? <Check className="h-5 w-5" /> : "2"}
              </div>
              <span className="text-xs mt-2 font-medium">Documents</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={(e)=>{e.preventDefault()}} className="space-y-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-emerald-800 font-medium">Full Name</Label>
                  <Input 
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="border-emerald-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    placeholder="As it appears on bank account"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-emerald-800 font-medium">Loan Amount ($)</Label>
                  <Input 
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="border-emerald-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    placeholder="How much do you need?"
                    min="1000"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="term" className="text-emerald-800 font-medium">Loan Term</Label>
                  <Select
                    value={formData.term}
                    onValueChange={(value) => handleInputChange('term', value)}
                  >
                    <SelectTrigger id="term" className="border-emerald-200 focus:ring-emerald-500">
                      <SelectValue placeholder="Select loan term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                      <SelectItem value="36">36 months</SelectItem>
                      <SelectItem value="48">48 months</SelectItem>
                      <SelectItem value="60">60 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus" className="text-emerald-800 font-medium">Employment Status</Label>
                  <Select
                    value={formData.employmentStatus}
                    onValueChange={(value) => handleInputChange('employmentStatus', value)}
                  >
                    <SelectTrigger id="employmentStatus" className="border-emerald-200 focus:ring-emerald-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullTime">Full-time employed</SelectItem>
                      <SelectItem value="partTime">Part-time employed</SelectItem>
                      <SelectItem value="selfEmployed">Self-employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome" className="text-emerald-800 font-medium">Monthly Income ($)</Label>
                <Input 
                  id="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  className="border-emerald-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                  placeholder="Your monthly income"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employmentAddress" className="text-emerald-800 font-medium">Employment Address</Label>
                <Input 
                  id="employmentAddress"
                  value={formData.employmentAddress}
                  onChange={(e) => handleInputChange('employmentAddress', e.target.value)}
                  className="border-emerald-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                  placeholder="Current employer address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose" className="text-emerald-800 font-medium">Reason for Loan</Label>
                <Textarea 
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="border-emerald-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                  placeholder="Describe the purpose of your loan"
                  rows={4}
                  required
                />
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6 ">
              <div className="border-2 border-dashed border-emerald-200 rounded-lg p-8 text-center bg-emerald-50 transition-all hover:border-emerald-300 hover:bg-emerald-100/50">
                <UploadCloud className="mx-auto h-14 w-14 text-emerald-500" />
                <div className="mt-3">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-base font-medium text-emerald-800">
                      Upload supporting documents
                    </span>
                    <span className="mt-1 block text-sm text-emerald-600">
                      ID, proof of income, bank statements, etc.
                    </span>
                    <Input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                    />
                    <Button type="button" variant="outline" size="sm" className="mt-4 border-emerald-500 text-emerald-700 hover:bg-emerald-100">
                      Select Files
                    </Button>
                  </Label>
                </div>
              </div>
              
              {formData.documents.length > 0 && (
                <div className="space-y-3 w-full">
                  <Label className="text-emerald-800 w-5/6 font-medium">Uploaded Documents</Label>
                  <ScrollArea className="h-8 rounded-md border w-5/6 border-emerald-200 p-4">
                    {formData.documents.map((file, index) => (
                      <div key={index} className="flex items-center w-5/6 justify-between py-2 px-2 hover:bg-emerald-50 rounded">
                        <div className="flex items-center w-5/6">
                          <FileText className="h-5  mr-3  text-emerald-600" />
                          <span className="text-sm truncate max-w-sm">{file.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
              
              <div className="space-y-4 pt-4 border-t border-emerald-100">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="termsAgreed" 
                    checked={formData.termsAgreed}
                    onCheckedChange={(checked) => handleInputChange('termsAgreed', checked)}
                    className="mt-1 border-emerald-400 text-emerald-600"
                  />
                  <Label htmlFor="termsAgreed" className="text-sm leading-relaxed">
                    I have read the important information and accept that by completing the application I will be bound by the terms and conditions.
                  </Label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="creditCheck" 
                    checked={formData.creditCheck}
                    onCheckedChange={(checked) => handleInputChange('creditCheck', checked)}
                    className="mt-1 border-emerald-400 text-emerald-600"
                  />
                  <Label htmlFor="creditCheck" className="text-sm leading-relaxed">
                    I understand that any personal and credit information obtained may be disclosed from time to time to other lenders, credit bureaus or other credit reporting agencies.
                  </Label>
                </div>
              </div>
            </div>
          )}
        </form>
   
        {step > 1 ? (
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStep}
            className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        ) : (
          <div></div>
        )}
        
        {step < 2 ? (
          <Button 
            type="button" 
            onClick={nextStep}
            className="bg-emerald-600 mt-2 float-right hover:bg-emerald-700 text-white ml-auto"
          >
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            className="bg-emerald-600 float-right hover:bg-emerald-700 text-white ml-auto"
          >
            Submit Application <Check className="h-4 w-4 ml-2" />
          </Button>
        )}
     
    </div>
  );
}