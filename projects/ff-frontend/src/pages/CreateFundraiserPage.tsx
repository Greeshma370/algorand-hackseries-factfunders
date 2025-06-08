import React, { useState } from "react";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { showErrorToast, showInfoToast, showSuccessToast, toastMessages } from "../utils/toast";
import Button from "../components/common/Button";
import { appClient, syncTimeOffsetInLocalNet } from "../data/clients";
import { useWallet } from "@txnlab/use-wallet-react";
import * as algokit from "@algorandfoundation/algokit-utils";
import { categories } from "../data/getters";
import { useNavigate } from "react-router-dom";

interface Milestone {
  id: string;
  name: string;
  amount: string;
}

interface FormData {
  name: string;
  title: string;
  description: string;
  category: string;
  amountRequired: string;
  milestones: Milestone[];
}

const CreateFundraiserPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    title: "",
    description: "",
    category: "",
    amountRequired: "",
    milestones: [{ id: "1", name: "", amount: "" }],
  });

  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { activeAddress, transactionSigner } = useWallet();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "description" && value.length > 180) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMilestoneChange = (id: string, field: "name" | "amount", value: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((milestone) => (milestone.id === id ? { ...milestone, [field]: value } : milestone)),
    }));

    // Clear milestone errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`milestone_${id}_${field}`];
      delete newErrors["milestones_total"];
      return newErrors;
    });
  };

  const addMilestone = () => {
    if (formData.milestones.length < 5) {
      const newId = Date.now().toString();
      setFormData((prev) => ({
        ...prev,
        milestones: [...prev.milestones, { id: newId, name: "", amount: "" }],
      }));
    }
  };

  const removeMilestone = (id: string) => {
    if (formData.milestones.length > 1) {
      setFormData((prev) => ({
        ...prev,
        milestones: prev.milestones.filter((milestone) => milestone.id !== id),
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic field validation
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.amountRequired || parseFloat(formData.amountRequired) < 1) {
      newErrors.amountRequired = "Amount required must be at least 1";
    }

    // Milestone validation
    let totalMilestoneAmount = 0;
    formData.milestones.forEach((milestone) => {
      if (!milestone.name.trim()) {
        newErrors[`milestone_${milestone.id}_name`] = "Milestone name is required";
      }
      if (!milestone.amount || parseFloat(milestone.amount) < 0) {
        newErrors[`milestone_${milestone.id}_amount`] = "Amount must be 0 or greater";
      } else {
        totalMilestoneAmount += parseFloat(milestone.amount);
      }
    });

    // Check if milestone total equals required amount
    const requiredAmount = parseFloat(formData.amountRequired) || 0;
    if (Math.abs(totalMilestoneAmount - requiredAmount) > 0.000001) {
      newErrors.milestones_total = "Total milestone amounts must equal the required amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showErrorToast(toastMessages.fundraiser.validationError);
      return;
    }

    if (!activeAddress || !transactionSigner) {
      showErrorToast(toastMessages.fundraiser.walletNotConnected);
      return;
    }

    setFormStatus("submitting");
    showInfoToast(toastMessages.fundraiser.creating);

    try {
      await syncTimeOffsetInLocalNet();
      const result = await appClient.send.createProposal({
        args: {
          name: formData.name,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          amountRequired: algokit.algos(BigInt(formData.amountRequired)).microAlgos,
          milestones: formData.milestones.map((milestone) => [milestone.name, algokit.algos(BigInt(milestone.amount)).microAlgos]),
        },
        signer: transactionSigner,
        sender: activeAddress,
        populateAppCallResources: true,
      });
      console.log(result);
      setFormStatus("success");
      showSuccessToast(toastMessages.fundraiser.created);
      navigate(`/donate`);
    } catch (error) {
      setFormStatus("error");
      showErrorToast(toastMessages.fundraiser.failed);
      console.error(error);
    }
  };

  const remainingChars = 180 - formData.description.length;
  const totalMilestoneAmount = formData.milestones.reduce((sum, milestone) => sum + (parseFloat(milestone.amount) || 0), 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Start Your Fundraiser</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create a transparent, milestone-based fundraising campaign on the blockchain.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter project title"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description * ({remainingChars} characters remaining)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  maxLength={180}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Describe your project in 180 characters or less"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label htmlFor="amountRequired" className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount Required * (ALGO)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      id="amountRequired"
                      name="amountRequired"
                      value={formData.amountRequired}
                      onChange={handleInputChange}
                      min="1"
                      step="0.000001"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.amountRequired ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="0.000000"
                    />
                  </div>
                  {errors.amountRequired && <p className="text-red-500 text-sm mt-1">{errors.amountRequired}</p>}
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Milestones</h2>
                <div className="text-sm text-gray-600">Total: {totalMilestoneAmount.toFixed(6)} ALGO</div>
              </div>

              {errors.milestones_total && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm">{errors.milestones_total}</p>
                </div>
              )}

              <div className="space-y-4">
                {formData.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">Milestone {index + 1}</h3>
                      {formData.milestones.length > 1 && (
                        <button type="button" onClick={() => removeMilestone(milestone.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Milestone Name *</label>
                        <input
                          type="text"
                          value={milestone.name}
                          onChange={(e) => handleMilestoneChange(milestone.id, "name", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`milestone_${milestone.id}_name`] ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder="Enter milestone name"
                        />
                        {errors[`milestone_${milestone.id}_name`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`milestone_${milestone.id}_name`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ALGO) *</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="number"
                            value={milestone.amount}
                            onChange={(e) => handleMilestoneChange(milestone.id, "amount", e.target.value)}
                            min="0"
                            step="0.000001"
                            className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`milestone_${milestone.id}_amount`] ? "border-red-300" : "border-gray-300"
                            }`}
                            placeholder="0.000000"
                          />
                        </div>
                        {errors[`milestone_${milestone.id}_amount`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`milestone_${milestone.id}_amount`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.milestones.length < 5 && (
                <button
                  type="button"
                  onClick={addMilestone}
                  className="mt-4 flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus size={18} className="mr-1" />
                  Add Milestone
                </button>
              )}

              <p className="text-sm text-gray-600 mt-2">
                You can add up to 5 milestones. The total of all milestone amounts must equal the required amount.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button type="submit" variant="primary" size="lg" disabled={formStatus === "submitting"} className="w-full md:w-auto">
                {formStatus === "submitting" ? "Creating Fundraiser..." : "Create Fundraiser"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFundraiserPage;
